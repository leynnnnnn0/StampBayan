<?php

use App\Models\Business;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\StampCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('admin users can view platform dashboard metrics', function () {
    $this->withoutVite();

    $owner = User::factory()->create([
        'role' => 'business',
        'username' => 'cafe-owner',
        'email' => 'owner@example.com',
    ]);
    $admin = User::factory()->withoutTwoFactor()->create([
        'role' => 'admin',
    ]);
    $business = Business::factory()->for($owner)->create([
        'name' => 'Cafe Uno',
        'created_at' => now()->subDays(10),
    ]);
    $card = LoyaltyCard::factory()->for($business)->create();
    $customer = Customer::factory()->for($business)->create();

    Customer::factory()->for($business)->count(2)->create();

    StampCode::create([
        'user_id' => $owner->id,
        'business_id' => $business->id,
        'loyalty_card_id' => $card->id,
        'customer_id' => $customer->id,
        'code' => 'ADMIN-DASH-STAMP-RECENT',
        'used_at' => now()->subDays(2),
        'is_expired' => false,
        'is_offline_code' => false,
        'number_of_stamps' => 4,
    ]);
    StampCode::create([
        'user_id' => $owner->id,
        'business_id' => $business->id,
        'loyalty_card_id' => $card->id,
        'customer_id' => $customer->id,
        'code' => 'ADMIN-DASH-STAMP-OLD',
        'used_at' => now()->subDays(40),
        'is_expired' => false,
        'is_offline_code' => false,
        'number_of_stamps' => 2,
    ]);

    DB::table('sessions')->insert([
        'id' => 'admin-session',
        'user_id' => $admin->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Pest',
        'payload' => '',
        'last_activity' => now()->timestamp,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard/Index')
            ->where('summary.totalSignups', 2)
            ->where('summary.activeUsers', 1)
            ->where('summary.totalBusinesses', 1)
            ->where('summary.totalCustomers', 3)
            ->where('summary.totalStamps', 6)
            ->where('summary.totalLoyaltyCards', 1)
            ->has('businesses', 1)
            ->where('businesses.0.name', 'Cafe Uno')
            ->where('businesses.0.owner_username', 'cafe-owner')
            ->where('businesses.0.customers_count', 3)
            ->where('businesses.0.stamps_count', 6)
            ->where('businesses.0.stamps_last_30_days', 4)
            ->where('businesses.0.active_customers_count', 1)
            ->where('businesses.0.loyalty_cards_count', 1)
            ->where('businesses.0.average_stamps_per_day', 0.1)
        );
});

test('business users cannot view the admin dashboard regardless of user id', function () {
    $user = User::factory()->create([
        'role' => 'business',
    ]);

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admin logins redirect to the admin dashboard regardless of user id', function () {
    User::factory()->create([
        'role' => 'business',
    ]);

    $admin = User::factory()->withoutTwoFactor()->create([
        'email' => 'admin@example.com',
        'password' => Hash::make('password'),
        'role' => 'admin',
    ]);

    $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect(route('admin.dashboard'));
});

test('first user business logins redirect to the business dashboard', function () {
    $owner = User::factory()->withoutTwoFactor()->create([
        'email' => 'first-owner@example.com',
        'password' => Hash::make('password'),
        'role' => 'business',
    ]);
    Business::factory()->for($owner)->create();

    $this->post('/login', [
        'email' => $owner->email,
        'password' => 'password',
    ])->assertRedirect(route('dashboard'));
});
