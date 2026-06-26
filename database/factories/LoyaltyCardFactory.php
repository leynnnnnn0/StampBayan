<?php

namespace Database\Factories;

use App\Models\Business;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LoyaltyCard>
 */
class LoyaltyCardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'name' => fake()->unique()->words(3, true),
            'heading' => 'LOYALTY CARD',
            'subheading' => 'Collect stamps and earn rewards!',
            'stampsNeeded' => 10,
            'valid_until' => now()->addMonth()->toDateString(),
            'mechanics' => 'Get 1 stamp per purchase.',
            'backgroundColor' => '#4DB6AC',
            'textColor' => '#FFFFFF',
            'stampColor' => '#4DB6AC',
            'stampFilledColor' => '#FF6B6B',
            'stampEmptyColor' => '#E5E7EB',
            'footer' => 'stampbayan.com',
            'stampShape' => 'star',
        ];
    }
}
