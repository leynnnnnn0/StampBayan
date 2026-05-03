<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\CompletedLoyaltyCard;
use App\Models\LoyaltyCard;
use App\Models\PerkClaim;
use App\Models\StampCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StampCodeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $stampCodes = StampCode::withTrashed()->with('loyalty_card')->where('business_id', Auth::user()->business->id)
            ->with('customer:id,username,email')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($customerQuery) use ($search) {
                            $customerQuery->where('username', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Business/StampCode/Index', [
            'stampCodes' => $stampCodes,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function record(Request $request)
    {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'exists:stamp_codes,code',
                function ($attribute, $value, $fail) {
                    $stampCode = StampCode::where('code', $value)->first();
                    if (!$stampCode) {
                        $fail('The stamp code is invalid for this loyalty card.');
                    } elseif ($stampCode->is_expired) {
                        $fail('This stamp code has expired.');
                    } elseif ($stampCode->used_at !== null) {
                        $fail('This stamp code has already been used.');
                    } elseif ($stampCode->business_id != Auth::guard('customer')->user()->business_id) {
                        $fail('This stamp code does not belong to this business');
                    }
                },
            ],
            'loyalty_card_id' => 'required|exists:loyalty_cards,id'
        ]);

        $stampCode = StampCode::where('code', $validated['code'])
            ->whereNull('used_at')
            ->where('is_expired', false)
            ->first();

        if (!$stampCode) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired stamp code.'], 400);
        }

        $customerId = Auth::guard('customer')->user()->id;

        try {
            return DB::transaction(function () use ($stampCode, $customerId) {
                // Update the stamp code
                $stampCode->update([
                    'customer_id' => $customerId,
                    'used_at' => now(),
                ]);

                $loyaltyCard = LoyaltyCard::with('perks')->find($stampCode->loyalty_card_id);

                // Total stamps BEFORE this batch
                $previousTotal = StampCode::where('customer_id', $customerId)
                    ->where('loyalty_card_id', $stampCode->loyalty_card_id)
                    ->whereNotNull('used_at')
                    ->sum('number_of_stamps') - $stampCode->number_of_stamps;

                $newTotal = $previousTotal + $stampCode->number_of_stamps;

                // Calculate perks across all cycles spanned
                $newlyUnlockedPerks = [];
                foreach ($loyaltyCard->perks as $perk) {
                    $stampNumber = (int) $perk->stampNumber;
                    $stampsNeeded = $loyaltyCard->stampsNeeded;

                    $timesUnlocked = 0;
                    $checkpoint = $previousTotal - ($previousTotal % $stampsNeeded) + $stampNumber;

                    while ($checkpoint <= $newTotal) {
                        if ($checkpoint > $previousTotal) {
                            $timesUnlocked++;
                        }
                        $checkpoint += $stampsNeeded;
                    }

                    for ($i = 0; $i < $timesUnlocked; $i++) {
                        PerkClaim::create([
                            'customer_id' => $customerId,
                            'loyalty_card_id' => $stampCode->loyalty_card_id,
                            'perk_id' => $perk->id,
                            'stamps_at_claim' => $newTotal,
                            'is_redeemed' => false,
                        ]);
                        $newlyUnlockedPerks[] = $perk->reward;
                    }
                }

                $cyclesCompleted = 0;


                // Loop to handle multiple completions
                while ($newTotal >= $loyaltyCard->stampsNeeded) {
                    $excessStamps = $newTotal - $loyaltyCard->stampsNeeded;

                    $usedStamps = StampCode::where('customer_id', $customerId)
                        ->where('loyalty_card_id', $stampCode->loyalty_card_id)
                        ->whereNotNull('used_at')
                        ->orderBy('used_at', 'asc')
                        ->get();

                    $stampsData = $usedStamps->map(fn($stamp) => [
                        'id' => $stamp->id,
                        'code' => $stamp->code,
                        'used_at' => $stamp->used_at,
                    ])->toArray();

                    $previousCompletions = CompletedLoyaltyCard::where('customer_id', $customerId)
                        ->where('loyalty_card_id', $stampCode->loyalty_card_id)
                        ->count();

                    CompletedLoyaltyCard::create([
                        'customer_id' => $customerId,
                        'loyalty_card_id' => $stampCode->loyalty_card_id,
                        'stamps_collected' => $loyaltyCard->stampsNeeded,
                        'completed_at' => now(),
                        'card_cycle' => $previousCompletions + 1,
                        'stamps_data' => json_encode($stampsData),
                    ]);

                    // Delete all used stamps for this cycle
                    StampCode::where('customer_id', $customerId)
                        ->where('loyalty_card_id', $stampCode->loyalty_card_id)
                        ->whereNotNull('used_at')
                        ->delete();

                    // Carry over excess stamps to next cycle
                    if ($excessStamps > 0) {
                        StampCode::create([
                            'user_id' => $stampCode->user_id,
                            'business_id' => $stampCode->business_id,
                            'customer_id' => $customerId,
                            'loyalty_card_id' => $stampCode->loyalty_card_id,
                            'code' => 'CARRY-' . uniqid(),
                            'used_at' => now(),
                            'is_expired' => false,
                            'is_offline_code' => false,
                            'number_of_stamps' => $excessStamps,
                        ]);
                    }

                    $cyclesCompleted++;
                    $newTotal = $excessStamps;
                }

                if ($cyclesCompleted > 0) {
                    $message = $cyclesCompleted > 1
                        ? "Congratulations! You completed your loyalty card {$cyclesCompleted} times!"
                        : 'Congratulations! You completed your loyalty card!';

                    if (!empty($newlyUnlockedPerks)) {
                        $message .= ' New rewards unlocked: ' . implode(', ', $newlyUnlockedPerks);
                    }

                    $totalCompletions = CompletedLoyaltyCard::where('customer_id', $customerId)
                        ->where('loyalty_card_id', $stampCode->loyalty_card_id)
                        ->count();

                    return back()->with([
                        'success' => true,
                        'active_card_id' => $stampCode->loyalty_card_id,
                        'card_completed' => true,
                        'message' => $message,
                        'cycle_number' => $totalCompletions,
                        'newly_unlocked_perks' => $newlyUnlockedPerks
                    ]);
                }

                $message = 'Stamp recorded successfully!';
                if (!empty($newlyUnlockedPerks)) {
                    $message .= ' New rewards unlocked: ' . implode(', ', $newlyUnlockedPerks);
                }

                return back()->with([
                    'success' => true,
                    'active_card_id' => $stampCode->loyalty_card_id,
                    'card_completed' => false,
                    'message' => $message,
                    'stamps_remaining' => $loyaltyCard->stampsNeeded - $newTotal,
                    'newly_unlocked_perks' => $newlyUnlockedPerks
                ]);
            });
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to record stamp. Please try again.']);
        }
    }
}
