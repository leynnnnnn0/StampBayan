<?php

use App\Models\Business;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\Perk;
use App\Models\PerkClaim;
use App\Models\Staff;
use App\Models\StampCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

function businessUser(): array
{
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    return [$user, $business];
}

test('business users can create a loyalty card with perks', function () {
    [$user, $business] = businessUser();

    $response = $this->actingAs($user)->post(route('card-templates.store'), [
        'name' => 'Coffee Rewards',
        'heading' => 'LOYALTY CARD',
        'subheading' => 'Collect stamps and earn rewards!',
        'valid_until' => now()->addMonth()->toDateString(),
        'stampsNeeded' => 10,
        'mechanics' => 'Get 1 stamp per purchase.',
        'backgroundColor' => '#4DB6AC',
        'textColor' => '#FFFFFF',
        'stampColor' => '#4DB6AC',
        'stampFilledColor' => '#FF6B6B',
        'stampEmptyColor' => '#E5E7EB',
        'footer' => 'stampbayan.com',
        'stampShape' => 'star',
        'perks' => [
            [
                'stampNumber' => 5,
                'reward' => '10% OFF',
                'color' => '#FF6B6B',
                'details' => 'Discount on next purchase.',
            ],
        ],
    ]);

    $response->assertRedirect(route('card-templates.index'));

    $this->assertDatabaseHas('loyalty_cards', [
        'business_id' => $business->id,
        'name' => 'Coffee Rewards',
        'stampsNeeded' => 10,
    ]);

    $this->assertDatabaseHas('perks', [
        'reward' => '10% OFF',
        'stampNumber' => 5,
    ]);
});

test('business users can issue a stamp code only for their own active loyalty cards', function () {
    [$user, $business] = businessUser();
    $card = LoyaltyCard::factory()->for($business)->create();
    $otherCard = LoyaltyCard::factory()->create();

    $this->actingAs($user)->get('/business/issue-stamp?loyalty_card_id='.$card->id.'&number_of_stamps=3')
        ->assertOk();

    $this->assertDatabaseHas('stamp_codes', [
        'business_id' => $business->id,
        'loyalty_card_id' => $card->id,
        'number_of_stamps' => 3,
        'is_expired' => false,
    ]);

    $this->actingAs($user)->get('/business/issue-stamp?loyalty_card_id='.$otherCard->id.'&number_of_stamps=3')
        ->assertOk();

    expect(StampCode::where('loyalty_card_id', $otherCard->id)->exists())->toBeFalse();
});

test('customer registration creates and authenticates the customer for the selected business', function () {
    $business = Business::factory()->create();

    $response = $this->post(route('customer.register'), [
        'business_id' => $business->id,
        'username' => 'maria',
        'email' => 'maria@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('customer.dashboard'));
    $this->assertAuthenticated('customer');
    $this->assertDatabaseHas('customers', [
        'business_id' => $business->id,
        'username' => 'maria',
        'email' => 'maria@example.com',
    ]);
});

test('perk claims can be redeemed by the owning business and not another business', function () {
    [$user, $business] = businessUser();
    [$otherUser] = businessUser();

    $customer = Customer::factory()->for($business)->create();
    $card = LoyaltyCard::factory()->for($business)->create();
    $perk = Perk::factory()->for($card, 'loyaltyCard')->create();
    $claim = PerkClaim::create([
        'customer_id' => $customer->id,
        'loyalty_card_id' => $card->id,
        'perk_id' => $perk->id,
        'stamps_at_claim' => 5,
        'is_redeemed' => false,
    ]);

    $this->actingAs($otherUser)->post(route('perk-claims.redeem', $claim), [
        'remarks' => 'wrong business',
    ])->assertForbidden();

    $this->actingAs($user)->post(route('perk-claims.redeem', $claim), [
        'remarks' => 'claimed in store',
    ])->assertRedirect();

    expect($claim->refresh())
        ->is_redeemed->toBeTrue()
        ->redeemed_by->toBe($user->id)
        ->remarks->toBe('claimed in store');
});

test('business users can cancel an accidentally issued stamp', function () {
    [$user, $business] = businessUser();
    $customer = Customer::factory()->for($business)->create();
    $card = LoyaltyCard::factory()->for($business)->create([
        'stampsNeeded' => 10,
    ]);
    $perk = Perk::factory()->for($card, 'loyaltyCard')->create([
        'stampNumber' => 5,
    ]);
    $stamp = StampCode::create([
        'user_id' => $user->id,
        'business_id' => $business->id,
        'loyalty_card_id' => $card->id,
        'customer_id' => $customer->id,
        'code' => 'TEST-CANCEL-STAMP',
        'used_at' => now(),
        'is_expired' => false,
        'is_offline_code' => false,
        'number_of_stamps' => 5,
    ]);
    PerkClaim::create([
        'customer_id' => $customer->id,
        'loyalty_card_id' => $card->id,
        'perk_id' => $perk->id,
        'stamps_at_claim' => 5,
        'is_redeemed' => false,
    ]);

    $this->actingAs($user)
        ->post("/business/stamp-codes/{$stamp->id}/cancel")
        ->assertRedirect();

    expect($stamp->refresh()->trashed())->toBeTrue();
    expect(PerkClaim::where('customer_id', $customer->id)->exists())->toBeFalse();
});

test('staff users can scan a customer qr and issue selected stamps', function () {
    $business = Business::factory()->create();
    $staff = Staff::factory()->for($business)->create();
    $customer = Customer::factory()->for($business)->create();
    $card = LoyaltyCard::factory()->for($business)->create();

    $signature = substr(hash_hmac('sha256', "{$customer->id}|{$business->id}", config('app.key')), 0, 24);
    $customerQr = "stampbayan:customer:{$customer->id}:{$business->id}:{$signature}";

    $this->actingAs($staff, 'staff')
        ->post(route('staff.scan-customer'), [
            'customer_qr' => $customerQr,
            'loyalty_card_id' => $card->id,
            'number_of_stamps' => 4,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('stamp_codes', [
        'business_id' => $business->id,
        'customer_id' => $customer->id,
        'loyalty_card_id' => $card->id,
        'number_of_stamps' => 4,
        'is_expired' => false,
    ]);
});

test('active staff users can log in without remember token support', function () {
    $business = Business::factory()->create();
    $staff = Staff::factory()->for($business)->create([
        'username' => 'batangas-staff',
        'password' => Hash::make('password'),
    ]);

    $this->post('/staff/login', [
        'username' => 'batangas-staff',
        'password' => 'password',
    ])
        ->assertRedirect(route('staff.dashboard'));

    $this->assertAuthenticatedAs($staff, 'staff');
});
