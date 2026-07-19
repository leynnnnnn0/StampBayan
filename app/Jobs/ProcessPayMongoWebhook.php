<?php

namespace App\Jobs;

use App\Models\BackupPayment;
use App\Models\BackupSubscription;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class ProcessPayMongoWebhook implements ShouldQueue
{
    use Queueable;

    public function __construct(public array $payload) {}

    public function handle(): void
    {
        $event = $this->payload['data'] ?? null;

        if (! is_array($event)) {
            return;
        }

        $attributes = $event['attributes'] ?? [];
        $eventType = $attributes['type'] ?? $event['type'] ?? null;

        if ($eventType !== 'checkout_session.payment.paid') {
            return;
        }

        $session = $attributes['data'] ?? $event['data'] ?? null;

        if (! is_array($session)) {
            return;
        }

        $sessionAttributes = $session['attributes'] ?? [];
        $expectedLivemode = (bool) config('services.paymongo.livemode', false);
        $actualLivemode = $attributes['livemode'] ?? $sessionAttributes['livemode'] ?? null;

        if ($actualLivemode !== null && (bool) $actualLivemode !== $expectedLivemode) {
            return;
        }

        $referenceNumber = $sessionAttributes['reference_number'] ?? null;
        $sessionId = $session['id'] ?? null;
        $eventId = $event['id'] ?? null;

        if (! is_string($referenceNumber) || ! is_string($eventId)) {
            return;
        }

        DB::transaction(function () use ($referenceNumber, $sessionId, $eventId, $sessionAttributes) {
            $payment = BackupPayment::query()
                ->where('reference_number', $referenceNumber)
                ->lockForUpdate()
                ->first();

            if (! $payment || $payment->status === 'paid' || $payment->webhook_event_id === $eventId) {
                return;
            }

            if ($payment->checkout_session_id && $sessionId && ! hash_equals($payment->checkout_session_id, $sessionId)) {
                return;
            }

            $subscription = BackupSubscription::query()
                ->where('business_id', $payment->business_id)
                ->lockForUpdate()
                ->first();

            $startsAt = $subscription?->expires_at?->isFuture()
                ? $subscription->expires_at->copy()
                : now();
            $expiresAt = $startsAt->copy()->addDays(30);
            $paymongoPaymentId = data_get($sessionAttributes, 'payments.0.id')
                ?? data_get($sessionAttributes, 'payment_intent.id');

            $payment->update([
                'status' => 'paid',
                'webhook_event_id' => $eventId,
                'paymongo_payment_id' => $paymongoPaymentId,
                'paid_at' => now(),
            ]);

            BackupSubscription::updateOrCreate(
                ['business_id' => $payment->business_id],
                [
                    'activated_at' => now(),
                    'expires_at' => $expiresAt,
                    'last_paymongo_payment_id' => $paymongoPaymentId,
                    'last_checkout_session_id' => $sessionId,
                    'seven_day_reminder_sent_at' => null,
                    'three_day_reminder_sent_at' => null,
                    'one_day_reminder_sent_at' => null,
                    'expired_reminder_sent_at' => null,
                ],
            );
        });
    }
}
