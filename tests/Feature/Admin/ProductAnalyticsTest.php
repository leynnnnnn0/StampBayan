<?php

use App\Models\Business;
use App\Models\ProductAnalyticsEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admins can view product analytics', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Business::factory()->create();

    $this->actingAs($admin)
        ->get('/admin/product-analytics')
        ->assertOk();
});

test('non admins cannot view product analytics', function () {
    User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'business']);

    $this->actingAs($user)
        ->get('/admin/product-analytics')
        ->assertForbidden();
});

test('product analytics events are recorded', function () {
    $response = $this->post('/product-analytics/events', [
        'event_name' => 'page_view',
        'session_id' => 'test-session',
        'path' => '/pricing',
        'page_title' => 'Pricing',
        'metadata' => [
            'source' => 'test',
        ],
    ]);

    $response->assertNoContent();

    expect(ProductAnalyticsEvent::where('event_name', 'page_view')->where('path', '/pricing')->exists())->toBeTrue();
});
