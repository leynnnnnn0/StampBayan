<?php

use App\Jobs\ProcessPayMongoWebhook;
use App\Models\BackupPayment;
use App\Models\BackupSubscription;
use App\Models\Business;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\StampCode;
use App\Models\User;
use App\Notifications\BackupProtectionReminder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function backupBusinessUser(): array
{
    $user = User::factory()->create(['role' => 'business']);
    $business = Business::factory()->for($user)->create();

    return [$user, $business];
}

test('business users can view free export and inactive paid protection', function () {
    [$user] = backupBusinessUser();

    $this->withoutVite()
        ->actingAs($user)
        ->get(route('business.backups.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Business/Backup/Index')
            ->where('subscription.active', false)
            ->where('price', 99)
            ->where('backupTimes', ['8:00 AM', '10:00 PM'])
            ->where('facebookUrl', 'https://www.facebook.com/profile.php?id=61584319949414'));
});

test('basic customer backup downloads a branded pdf', function () {
    [$user, $business] = backupBusinessUser();
    $customer = Customer::factory()->for($business)->create(['username' => 'Maria Santos']);
    $card = LoyaltyCard::factory()->for($business)->create(['name' => 'Coffee Lovers']);

    StampCode::create([
        'user_id' => $user->id,
        'business_id' => $business->id,
        'customer_id' => $customer->id,
        'loyalty_card_id' => $card->id,
        'code' => 'BACKUP-PDF-STAMP',
        'used_at' => now(),
        'is_expired' => false,
        'is_offline_code' => false,
        'number_of_stamps' => 6,
    ]);

    $response = $this->actingAs($user)->get(route('business.backups.basic-export'));

    $response->assertOk()->assertDownload();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
    expect($response->getContent())->toStartWith('%PDF');
});

test('paymongo qrph checkout is created on the server', function () {
    [$user, $business] = backupBusinessUser();
    config(['services.paymongo.secret_key' => 'sk_test_example']);

    Http::fake([
        'api.paymongo.com/v2/checkout_sessions' => Http::response([
            'data' => [
                'id' => 'cs_test_backup',
                'attributes' => [
                    'checkout_url' => 'https://checkout.paymongo.com/test-backup',
                ],
            ],
        ]),
    ]);

    $this->actingAs($user)
        ->post(route('business.backups.checkout'), [], ['X-Inertia' => 'true'])
        ->assertStatus(409)
        ->assertHeader('X-Inertia-Location', 'https://checkout.paymongo.com/test-backup');

    $payment = BackupPayment::where('business_id', $business->id)->firstOrFail();

    expect($payment)
        ->amount->toBe(9900)
        ->status->toBe('pending')
        ->checkout_session_id->toBe('cs_test_backup');

    Http::assertSent(fn ($request) => $request->url() === 'https://api.paymongo.com/v2/checkout_sessions'
        && $request['data']['attributes']['payment_method_types'] === ['qrph']
        && $request['data']['attributes']['line_items'][0]['amount'] === 9900
        && $request->hasHeader('Idempotency-Key')
    );
});

test('verified paid checkout activates 30 days and duplicate events do not extend it', function () {
    Carbon::setTestNow('2026-07-19 10:00:00');
    [, $business] = backupBusinessUser();
    config(['services.paymongo.livemode' => false]);

    $payment = BackupPayment::create([
        'business_id' => $business->id,
        'reference_number' => 'SBP-TEST-PAID',
        'checkout_session_id' => 'cs_paid_backup',
        'amount' => 9900,
        'status' => 'pending',
    ]);

    $payload = paidBackupWebhookPayload($payment->reference_number, 'evt_paid_backup');

    (new ProcessPayMongoWebhook($payload))->handle();

    $subscription = BackupSubscription::where('business_id', $business->id)->firstOrFail();
    expect($payment->refresh()->status)->toBe('paid');
    expect($subscription->isActive())->toBeTrue();
    expect($subscription->expires_at->toDateTimeString())->toBe('2026-08-18 10:00:00');

    (new ProcessPayMongoWebhook($payload))->handle();

    expect($subscription->refresh()->expires_at->toDateTimeString())->toBe('2026-08-18 10:00:00');
    Carbon::setTestNow();
});

test('paymongo webhook verifies its signature before queueing activation', function () {
    Queue::fake();
    config(['services.paymongo.webhook_secret' => 'whsec_test']);
    $payload = paidBackupWebhookPayload('SBP-TEST-WEBHOOK', 'evt_webhook');
    $raw = json_encode($payload);

    $this->postJson(route('webhooks.paymongo'), $payload, [
        'Paymongo-Signature' => 'invalid',
    ])->assertUnauthorized();

    $this->call('POST', route('webhooks.paymongo'), [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_PAYMONGO_SIGNATURE' => hash_hmac('sha256', $raw, 'whsec_test'),
    ], $raw)->assertOk();

    Queue::assertPushed(ProcessPayMongoWebhook::class);
});

test('expiring backup plans send the configured reminder', function () {
    Notification::fake();
    [$user, $business] = backupBusinessUser();
    BackupSubscription::create([
        'business_id' => $business->id,
        'activated_at' => now()->subDays(27),
        'expires_at' => now()->addDays(3),
    ]);

    $this->artisan('backups:send-expiration-reminders')->assertSuccessful();

    Notification::assertSentTo($user, BackupProtectionReminder::class, fn ($notification) => $notification->daysRemaining === 3 && ! $notification->expired
    );
});

test('ticket page now directs businesses to facebook support', function () {
    [$user] = backupBusinessUser();

    $this->withoutVite()
        ->actingAs($user)
        ->get(route('tickets.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Business/Ticket/Index')
            ->where('facebookUrl', 'https://www.facebook.com/profile.php?id=61584319949414')
            ->missing('tickets'));
});

function paidBackupWebhookPayload(string $referenceNumber, string $eventId): array
{
    return [
        'data' => [
            'id' => $eventId,
            'type' => 'event',
            'attributes' => [
                'type' => 'checkout_session.payment.paid',
                'livemode' => false,
                'data' => [
                    'id' => 'cs_paid_backup',
                    'type' => 'checkout_session',
                    'attributes' => [
                        'reference_number' => $referenceNumber,
                        'livemode' => false,
                        'payments' => [['id' => 'pay_backup']],
                    ],
                ],
            ],
        ],
    ];
}
