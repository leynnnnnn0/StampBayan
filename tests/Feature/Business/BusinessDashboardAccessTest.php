<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('accounts without a business are redirected away from the business dashboard', function () {
    $admin = User::factory()->withoutTwoFactor()->create([
        'role' => 'admin',
    ]);

    $this->actingAs($admin)
        ->get('/business/dashboard')
        ->assertRedirect(route('home'))
        ->assertSessionHas('error', 'This account does not have a business dashboard.');
});
