<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\BackupPayment;
use App\Services\PayMongoCheckoutService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BackupController extends Controller
{
    public function index(Request $request)
    {
        $business = Auth::user()->business->load('backupSubscription');
        $subscription = $business->backupSubscription;
        $expiresAt = $subscription?->expires_at;
        $daysRemaining = $expiresAt?->isFuture()
            ? max(1, (int) now()->startOfDay()->diffInDays($expiresAt->copy()->startOfDay(), false))
            : 0;

        return Inertia::render('Business/Backup/Index', [
            'businessName' => $business->name,
            'subscription' => [
                'active' => $subscription?->isActive() ?? false,
                'activated_at' => $subscription?->activated_at?->toIso8601String(),
                'expires_at' => $expiresAt?->toIso8601String(),
                'expires_at_formatted' => $expiresAt?->format('F j, Y \a\t g:i A'),
                'days_remaining' => $daysRemaining,
            ],
            'paymentState' => $request->string('payment')->toString(),
            'facebookUrl' => config('services.facebook.support_url'),
            'price' => 99,
            'backupTimes' => ['8:00 AM', '10:00 PM'],
        ]);
    }

    public function downloadBasic()
    {
        $business = Auth::user()->business;

        $rows = DB::table('customers')
            ->leftJoin('stamp_codes', function ($join) use ($business) {
                $join->on('stamp_codes.customer_id', '=', 'customers.id')
                    ->where('stamp_codes.business_id', '=', $business->id)
                    ->whereNotNull('stamp_codes.used_at')
                    ->whereNull('stamp_codes.deleted_at');
            })
            ->leftJoin('loyalty_cards', 'loyalty_cards.id', '=', 'stamp_codes.loyalty_card_id')
            ->where('customers.business_id', $business->id)
            ->groupBy('customers.id', 'customers.username', 'loyalty_cards.id', 'loyalty_cards.name')
            ->orderBy('customers.username')
            ->orderBy('loyalty_cards.name')
            ->select([
                'customers.username as customer_name',
                DB::raw("COALESCE(loyalty_cards.name, 'No loyalty card') as loyalty_card"),
                DB::raw('COALESCE(SUM(stamp_codes.number_of_stamps), 0) as number_of_stamps'),
            ])
            ->get();

        $logoPath = public_path('images/mainLogo.png');
        $logoDataUri = is_file($logoPath)
            ? 'data:image/png;base64,'.base64_encode(file_get_contents($logoPath))
            : null;

        return Pdf::loadView('pdf.customer-backup', [
            'business' => $business,
            'rows' => $rows,
            'generatedAt' => now(),
            'logoDataUri' => $logoDataUri,
        ])->setPaper('a4')
            ->download(Str::slug($business->name).'-customer-backup-'.now()->format('Y-m-d').'.pdf');
    }

    public function checkout(PayMongoCheckoutService $payMongo)
    {
        $business = Auth::user()->business;

        $existingPayment = $business->backupPayments()
            ->where('status', 'pending')
            ->whereNotNull('checkout_url')
            ->where('created_at', '>=', now()->subMinutes(30))
            ->latest()
            ->first();

        if ($existingPayment) {
            return Inertia::location($existingPayment->checkout_url);
        }

        $payment = BackupPayment::create([
            'business_id' => $business->id,
            'reference_number' => sprintf(
                'SBP-%d-%s-%s',
                $business->id,
                now()->format('YmdHis'),
                Str::upper(Str::random(6)),
            ),
            'amount' => 9900,
            'status' => 'pending',
        ]);

        try {
            $checkout = $payMongo->createBackupCheckout($payment);
            $payment->update([
                'checkout_session_id' => $checkout['id'],
                'checkout_url' => $checkout['checkout_url'],
            ]);

            return Inertia::location($checkout['checkout_url']);
        } catch (\Throwable $exception) {
            $payment->update(['status' => 'failed']);
            Log::warning('Unable to create PayMongo backup checkout.', [
                'business_id' => $business->id,
                'payment_id' => $payment->id,
                'exception' => $exception::class,
            ]);

            return back()->with('error', 'Payment could not be started. Please try again in a moment.');
        }
    }
}
