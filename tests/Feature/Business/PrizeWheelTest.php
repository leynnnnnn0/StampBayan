<?php

use App\Models\Business;
use App\Models\PrizeWheelPrize;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('owners can update their vote and remarks without creating duplicate votes', function () {
    [$user] = prizeWheelBusinessUser();
    $this->actingAs($user)->post(route('prize-wheel.feedback'), [
        'liked' => true, 'remarks' => 'Looks great!',
    ])->assertSessionHasNoErrors();
    $this->actingAs($user)->post(route('prize-wheel.feedback'), [
        'liked' => false, 'remarks' => 'Please improve the preview.',
    ])->assertSessionHasNoErrors();
    $this->assertDatabaseCount('prize_wheel_feedback', 1);
    $this->assertDatabaseHas('prize_wheel_feedback', [
        'user_id' => $user->id, 'liked' => false, 'remarks' => 'Please improve the preview.',
    ]);
    $this->actingAs($user)->post(route('prize-wheel.feedback'), [
        'remarks' => 'Missing vote',
    ])->assertSessionHasErrors('liked');
});

function prizeWheelBusinessUser(): array
{
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    return [$user, $business];
}

test('business owners can open the prize wheel configuration', function () {
    [$user] = prizeWheelBusinessUser();

    $this->actingAs($user)
        ->get(route('prize-wheel.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Business/PrizeWheel/Index')
            ->where('wheel', null));
});

test('business owners can configure prize names and winning percentages', function () {
    [$user, $business] = prizeWheelBusinessUser();
    $image = UploadedFile::fake()->image('coffee.png', 300, 300);

    $this->actingAs($user)
        ->post(route('prize-wheel.update'), [
            'title' => 'Join and Win',
            'description' => 'Join our loyalty program for a chance to win.',
            'is_active' => true,
            'prizes' => [
                [
                    'name' => 'Free Coffee',
                    'probability' => 25,
                    'color' => '#F8B83E',
                    'image' => $image,
                ],
                [
                    'name' => '10% Discount',
                    'probability' => 75,
                    'color' => '#1F2937',
                ],
            ],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('prize_wheels', [
        'business_id' => $business->id,
        'title' => 'Join and Win',
        'is_active' => true,
    ]);
    $this->assertDatabaseHas('prize_wheel_prizes', [
        'name' => 'Free Coffee',
        'probability' => 25,
        'sort_order' => 0,
    ]);
    $this->assertDatabaseHas('prize_wheel_prizes', [
        'name' => '10% Discount',
        'probability' => 75,
        'sort_order' => 1,
    ]);

    $imagePath = PrizeWheelPrize::where('name', 'Free Coffee')->value('image_path');
    expect($imagePath)->not->toBeNull();
    expect(File::isFile(public_path($imagePath)))->toBeTrue();
    File::delete(public_path($imagePath));
});

test('prize percentages must add up to one hundred percent', function () {
    [$user] = prizeWheelBusinessUser();

    $this->actingAs($user)
        ->post(route('prize-wheel.update'), [
            'title' => 'Join and Win',
            'description' => null,
            'is_active' => false,
            'prizes' => [
                ['name' => 'Prize A', 'probability' => 20, 'color' => '#F8B83E'],
                ['name' => 'Prize B', 'probability' => 20, 'color' => '#1F2937'],
            ],
        ])
        ->assertSessionHasErrors('prizes');

    $this->assertDatabaseCount('prize_wheels', 0);
});
