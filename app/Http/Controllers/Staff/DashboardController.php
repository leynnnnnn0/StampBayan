<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\CompletedLoyaltyCard;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\PerkClaim;
use App\Models\StampCode;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $staff = Auth::guard('staff')->user();
        $businessId = $staff->business_id;

        // Get loyalty cards for this business
        $cards = LoyaltyCard::where('business_id', $businessId)
            ->whereDate('valid_until', '>', today())
            ->select('id', 'name', 'logo')
            ->get();

        // Generate code if loyalty_card_id is provided
        $code = [
            'success' => false,
            'code' => '',
            'qr_url' => '',
            'created_at' => ''
        ];

        if ($request->has('loyalty_card_id') && $request->input('number_of_stamps', 1) > 0) {
            $loyaltyCardId = $request->input('loyalty_card_id');
            
            // Validate that the card belongs to this business
            $cardExists = $cards->contains('id', $loyaltyCardId);
            
            if ($cardExists) {
                $code = $this->generateStampCode($loyaltyCardId, $staff->id, $businessId, $request->integer('number_of_stamps', 1));
            }
        }

        // Get perk claims
        $perkClaims = PerkClaim::with([
                'customer:id,username,email',
                'perk:id,reward,details,stampNumber',
                'loyalty_card:id,name,logo',
                'redeemed_by:id,username'
            ])
            ->whereHas('loyalty_card', function ($query) use ($businessId) {
                $query->where('business_id', $businessId);
            })
            ->latest()
            ->limit(50)
            ->get();

        // Get stamp codes
        $stampCodes = StampCode::with(['loyalty_card:id,name', 'customer:id,username,email'])
            ->where('business_id', $businessId)
            ->latest()
            ->limit(50)
            ->get();

        // Get stats
        $stats = [
            'total' => PerkClaim::whereHas('loyalty_card', function ($query) use ($businessId) {
                $query->where('business_id', $businessId);
            })->count(),
            'available' => PerkClaim::whereHas('loyalty_card', function ($query) use ($businessId) {
                $query->where('business_id', $businessId);
            })->where('is_redeemed', false)->count(),
            'redeemed' => PerkClaim::whereHas('loyalty_card', function ($query) use ($businessId) {
                $query->where('business_id', $businessId);
            })->where('is_redeemed', true)->count(),
        ];

        return Inertia::render('Staff/Dashboard/Index', [
            'code' => $code,
            'cards' => $cards,
            'loyalty_card_id' => $request->input('loyalty_card_id', null),
            'perkClaims' => $perkClaims,
            'stampCodes' => $stampCodes,
            'stats' => $stats,
        ]);
    }

    private function generateStampCode($loyaltyCardId, $staffId, $businessId, int $numberOfStamps)
    {
        // Expire old unused codes
        StampCode::whereNull('used_at')
            ->where('created_at', '<=', Carbon::now()->subMinutes(15))
            ->where('is_offline_code', false)
            ->update([
                'is_expired' => true
            ]);

        // Generate unique code
        do {
            $code = strtoupper(Str::random(8));
        } while (StampCode::where('code', $code)->exists());

        // Create stamp code
        $stampCode = StampCode::create([
            'user_id' => $staffId,
            'business_id' => $businessId,
            'customer_id' => null,
            'loyalty_card_id' => $loyaltyCardId,
            'code' => $code,
            'used_at' => null,
            'is_expired' => false,
            'number_of_stamps' => $numberOfStamps,
        ]);

        return [
            'success' => true,
            'code' => $stampCode->code,
            'qr_url' => "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data={$stampCode->code}",
            'created_at' => $stampCode->created_at->format('M d, Y h:i A'),
            'number_of_stamps' => $stampCode->number_of_stamps,
        ];
    }

    public function recordCustomerScan(Request $request)
    {
        $validated = $request->validate([
            'customer_qr' => ['required', 'string'],
            'loyalty_card_id' => ['required', 'exists:loyalty_cards,id'],
            'number_of_stamps' => ['required', 'integer', 'min:1'],
        ]);

        $staff = Auth::guard('staff')->user();
        $businessId = $staff->business_id;
        $customer = $this->customerFromQrPayload($validated['customer_qr']);

        if (!$customer) {
            return back()->withErrors(['customer_qr' => 'This customer QR code is invalid.']);
        }

        $loyaltyCard = LoyaltyCard::where('business_id', $businessId)
            ->whereDate('valid_until', '>', today())
            ->find($validated['loyalty_card_id']);

        if (!$loyaltyCard) {
            return back()->withErrors(['loyalty_card_id' => 'Please select a valid loyalty card.']);
        }

        if ((int) $customer->business_id !== (int) $businessId) {
            return back()->withErrors(['customer_qr' => 'This customer does not belong to this business.']);
        }

        try {
            return DB::transaction(function () use ($staff, $businessId, $customer, $loyaltyCard, $validated) {
                $stampCode = StampCode::create([
                    'user_id' => $staff->id,
                    'business_id' => $businessId,
                    'customer_id' => $customer->id,
                    'loyalty_card_id' => $loyaltyCard->id,
                    'code' => 'SCAN-' . uniqid(),
                    'used_at' => now(),
                    'is_expired' => false,
                    'is_offline_code' => false,
                    'number_of_stamps' => $validated['number_of_stamps'],
                ]);

                return back()->with($this->stampResult($stampCode, $customer->id));
            });
        } catch (\Exception $e) {
            return back()->withErrors(['customer_qr' => 'Failed to issue stamp. Please try again.']);
        }
    }

    private function customerFromQrPayload(string $payload): ?Customer
    {
        $parts = explode(':', $payload);

        if (count($parts) !== 5 || $parts[0] !== 'stampbayan' || $parts[1] !== 'customer') {
            return null;
        }

        [, , $customerId, $businessId, $signature] = $parts;
        $expected = substr(hash_hmac('sha256', "{$customerId}|{$businessId}", config('app.key')), 0, 24);

        if (!hash_equals($expected, $signature)) {
            return null;
        }

        return Customer::whereKey($customerId)
            ->where('business_id', $businessId)
            ->first();
    }

    private function stampResult(StampCode $stampCode, int $customerId): array
    {
        $loyaltyCard = LoyaltyCard::with('perks')->find($stampCode->loyalty_card_id);

        $previousTotal = StampCode::where('customer_id', $customerId)
            ->where('loyalty_card_id', $stampCode->loyalty_card_id)
            ->whereNotNull('used_at')
            ->sum('number_of_stamps') - $stampCode->number_of_stamps;

        $newTotal = $previousTotal + $stampCode->number_of_stamps;
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

        while ($newTotal >= $loyaltyCard->stampsNeeded) {
            $excessStamps = $newTotal - $loyaltyCard->stampsNeeded;

            $usedStamps = StampCode::where('customer_id', $customerId)
                ->where('loyalty_card_id', $stampCode->loyalty_card_id)
                ->whereNotNull('used_at')
                ->orderBy('used_at', 'asc')
                ->get();

            $stampsData = $usedStamps->map(fn ($stamp) => [
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

            StampCode::where('customer_id', $customerId)
                ->where('loyalty_card_id', $stampCode->loyalty_card_id)
                ->whereNotNull('used_at')
                ->delete();

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

            return [
                'success' => true,
                'active_card_id' => $stampCode->loyalty_card_id,
                'card_completed' => true,
                'message' => $message,
                'newly_unlocked_perks' => $newlyUnlockedPerks,
            ];
        }

        $message = 'Stamp recorded successfully!';
        if (!empty($newlyUnlockedPerks)) {
            $message .= ' New rewards unlocked: ' . implode(', ', $newlyUnlockedPerks);
        }

        return [
            'success' => true,
            'active_card_id' => $stampCode->loyalty_card_id,
            'card_completed' => false,
            'message' => $message,
            'stamps_remaining' => $loyaltyCard->stampsNeeded - $newTotal,
            'newly_unlocked_perks' => $newlyUnlockedPerks,
        ];
    }

    public function generateOfflineStamps(Request $request)
    {
        $staff = Auth::guard('staff')->user();
        $businessId = $staff->business_id;
        $loyaltyCardId = $request->input('id');

        // Validate loyalty card belongs to business
        $card = LoyaltyCard::where('id', $loyaltyCardId)
            ->where('business_id', $businessId)
            ->first();

        if (!$card) {
            abort(403, 'Unauthorized');
        }

        // Get business info for registration link
        $business = $staff->business;
        $registrationLink = "https://stampbayan.com/customer/register?business=" . $business->qr_token;

        // Generate 8 unique codes and save to database
        $tickets = [];
        $stampCodesToInsert = [];
        
        for ($i = 0; $i < 8; $i++) {
            do {
                $code = strtoupper(Str::random(8));
            } while (
                StampCode::where('code', $code)->exists() || 
                in_array($code, array_column($tickets, 'code'))
            );

            // Prepare data for database insertion
            $stampCodesToInsert[] = [
                'user_id' => $staff->id,
                'business_id' => $businessId,
                'loyalty_card_id' => $loyaltyCardId, 
                'code' => $code,
                'is_offline_code' => true,
                'created_at' => now(),
                'updated_at' => now()
            ];

            // Generate QR code and convert to base64
            $qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($registrationLink);
            $qrImageData = file_get_contents($qrImageUrl);
            $qrCodeBase64 = 'data:image/png;base64,' . base64_encode($qrImageData);

            $tickets[] = [
                'code' => $code,
                'qr_code_base64' => $qrCodeBase64
            ];
        }

        // Bulk insert all stamp codes into database
        StampCode::insert($stampCodesToInsert);

        $html = view('pdf.offline-stamps', [
            'tickets' => $tickets,
            'registrationLink' => $registrationLink,
            'businessName' => $business->name
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('loyalty-stamps-' . date('Y-m-d') . '.pdf');
    }

    public function markAsRedeemed(Request $request, PerkClaim $perkClaim)
    {
        $staff = Auth::guard('staff')->user();
        $businessId = $staff->business_id;

        // Verify the perk claim belongs to this business
        if ($perkClaim->loyalty_card->business_id !== $businessId) {
            abort(403, 'Unauthorized action.');
        }

        if ($perkClaim->is_redeemed) {
            return back()->withErrors(['error' => 'This perk has already been redeemed.']);
        }

        $validated = $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        try {
            DB::transaction(function () use ($perkClaim, $validated, $staff) {
                $perkClaim->update([
                    'is_redeemed' => true,
                    'redeemed_at' => now(),
                    'redeemed_by' => $staff->id,
                    'remarks' => $validated['remarks'] ?? null,
                ]);
            });

            return back()->with('success', 'Perk marked as redeemed successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to mark perk as redeemed. Please try again.']);
        }
    }

    public function undoRedeem(PerkClaim $perkClaim)
    {
        $staff = Auth::guard('staff')->user();
        $businessId = $staff->business_id;

        // Verify the perk claim belongs to this business
        if ($perkClaim->loyalty_card->business_id !== $businessId) {
            abort(403, 'Unauthorized action.');
        }

        if (!$perkClaim->is_redeemed) {
            return back()->withErrors(['error' => 'This perk is not redeemed yet.']);
        }

        try {
            DB::transaction(function () use ($perkClaim) {
                $perkClaim->update([
                    'is_redeemed' => false,
                    'redeemed_at' => null,
                    'redeemed_by' => null,
                    'remarks' => null,
                ]);
            });

            return back()->with('success', 'Perk redemption undone successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to undo redemption. Please try again.']);
        }
    }
}
