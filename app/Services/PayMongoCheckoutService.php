<?php

namespace App\Services;

use App\Models\BackupPayment;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class PayMongoCheckoutService
{
    /**
     * @return array{id: string, checkout_url: string}
     *
     * @throws RequestException
     */
    public function createBackupCheckout(BackupPayment $payment): array
    {
        $secretKey = config('services.paymongo.secret_key');

        if (! is_string($secretKey) || $secretKey === '') {
            throw new \RuntimeException('PayMongo is not configured.');
        }

        $response = Http::withBasicAuth($secretKey, '')
            ->acceptJson()
            ->withHeaders([
                'Idempotency-Key' => 'backup-payment-'.$payment->id,
            ])
            ->post('https://api.paymongo.com/v2/checkout_sessions', [
                'data' => [
                    'attributes' => [
                        'line_items' => [[
                            'name' => 'StampBayan Data Protection',
                            'description' => '30 days of automatic database backup protection',
                            'amount' => $payment->amount,
                            'currency' => 'PHP',
                            'quantity' => 1,
                        ]],
                        'payment_method_types' => ['qrph'],
                        'success_url' => route('business.backups.index', ['payment' => 'processing']),
                        'cancel_url' => route('business.backups.index', ['payment' => 'cancelled']),
                        'reference_number' => $payment->reference_number,
                        'description' => 'StampBayan Data Protection — 30 days',
                        'send_email_receipt' => false,
                        'show_description' => true,
                        'show_line_items' => true,
                    ],
                ],
            ])
            ->throw();

        return [
            'id' => (string) $response->json('data.id'),
            'checkout_url' => (string) $response->json('data.attributes.checkout_url'),
        ];
    }
}
