<?php

use App\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('the separate admin dashboard redirects to the homepage', function () {
    $admin = User::factory()->withoutTwoFactor()->create([
        'role' => 'admin',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertRedirect(route('home'));
});

test('business users cannot access the admin dashboard route', function () {
    $user = User::factory()->create([
        'role' => 'business',
    ]);

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admin logins redirect to the homepage', function () {
    $admin = User::factory()->withoutTwoFactor()->create([
        'email' => 'admin@example.com',
        'password' => Hash::make('password'),
        'role' => 'admin',
    ]);

    $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect(route('home'));
});

test('business logins continue to redirect to the business dashboard', function () {
    $owner = User::factory()->withoutTwoFactor()->create([
        'email' => 'owner@example.com',
        'password' => Hash::make('password'),
        'role' => 'business',
    ]);
    Business::factory()->for($owner)->create();

    $this->post('/login', [
        'email' => $owner->email,
        'password' => 'password',
    ])->assertRedirect(route('dashboard'));
});
