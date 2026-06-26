<?php

use App\Models\Business;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    Business::factory()->for($user)->create();

    $this->actingAs($user);

    $this->get(route('dashboard'))->assertOk();
});
