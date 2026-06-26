<?php

namespace Database\Factories;

use App\Models\LoyaltyCard;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Perk>
 */
class PerkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'loyalty_card_id' => LoyaltyCard::factory(),
            'stampNumber' => 5,
            'reward' => fake()->randomElement(['10% OFF', 'FREE ITEM', 'VIP PERK']),
            'details' => fake()->sentence(),
            'color' => '#FF6B6B',
        ];
    }
}
