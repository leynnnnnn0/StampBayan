<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CompletedLoyaltyCard;
use App\Models\LoyaltyCard;
use App\Models\PerkClaim;
use App\Models\StampCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $customer = Auth::guard('customer')->user();

        // Get all loyalty cards for the business(es) the customer has interacted with
        $cardTemplates = LoyaltyCard::with('perks')
            ->where('business_id', $customer->business_id)
            ->whereDate('valid_until', '>', today())
            ->get();

        // Get active (non-archived) stamp codes for the customer
        $stampCodes = StampCode::where('customer_id', $customer->id)
            ->whereNotNull('used_at')
            ->orderBy('used_at', 'desc')
            ->get();

        // Get completed loyalty cards with loyalty card details
        $completedCards = CompletedLoyaltyCard::where('customer_id', $customer->id)
            ->with('loyaltyCard') // Eager load the loyalty card relationship
            ->recent() // Order by most recent completions
            ->get()
            ->map(function ($completed) {
                return [
                    'id' => $completed->id,
                    'loyalty_card_id' => $completed->loyalty_card_id,
                    'loyalty_card_name' => $completed->loyaltyCard->name,
                    'stamps_collected' => $completed->stamps_collected,
                    'completed_at' => $completed->completed_at,
                    'card_cycle' => $completed->card_cycle,
                    'stamps_data' => $completed->stamps_data,
                ];
            });

        $perkClaims = PerkClaim::where('customer_id', $customer->id)
            ->with('perk', 'loyalty_card')
            ->latest()
            ->get();

        return Inertia::render('Customer/Dashboard/Index', [
            'cardTemplates' => $cardTemplates,
            'stampCodes' => $stampCodes,
            'completedCards' => $completedCards,
            'customerName' => $this->greetingByTime() . ', ' . strtoupper($customer->username),
            'perkClaims' => $perkClaims,
            'customer' => $customer,
            'customerQrPayload' => $this->customerQrPayload($customer->id, $customer->business_id),
        ]);
    }

    private function customerQrPayload(int $customerId, int $businessId): string
    {
        $signature = substr(hash_hmac('sha256', "{$customerId}|{$businessId}", config('app.key')), 0, 24);

        return "stampbayan:customer:{$customerId}:{$businessId}:{$signature}";
    }

    function greetingByTime()
    {
        $hour = now()->format('H');

        if ($hour < 12) {
            return 'Good morning';
        } elseif ($hour < 18) {
            return 'Good afternoon';
        } else {
            return 'Good evening';
        }
    }

    /**
     * Update customer profile information
     */
    public function updateProfile(Request $request)
    {
           if (Auth::guard('customer')->user()->email === 'customer@gmail.com') {
            return redirect()->back()->withErrors(['error' => 'Demo account cannot make changes.']);
        }
        $customer = auth()->guard('customer')->user();

        $validated = $request->validate([
            'username' => ['required', 'string', 'max:255'],
        ]);

        $customer->update([
            'username' => $validated['username'],
        ]);

        return back()->with('flash', [
            'message' => 'Profile updated successfully',
            'type' => 'success'
        ]);
    }

    /**
     * Update customer password
     */
    public function updatePassword(Request $request)
    {
        if (Auth::guard('customer')->user()->email === 'customer@gmail.com') {
            return redirect()->back()->withErrors(['error' => 'Demo account cannot make changes.']);
        }
        $customer = Auth::guard('customer')->user();


        $validated = $request->validate([
            'current_password' => [
                'required',
                function ($attribute, $value, $fail) use ($customer) {
                    if (!Hash::check($value, $customer->password)) {
                        $fail('The current password is incorrect.');
                    }
                },
            ],
            'password' => ['required', 'confirmed', Password::min(8)],
            'password_confirmation' => ['required'],
        ]);

        $customer->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('flash', [
            'message' => 'Password updated successfully',
            'type' => 'success'
        ]);
    }
}
