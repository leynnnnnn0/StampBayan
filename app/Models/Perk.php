<?php

namespace App\Models;

use Database\Factories\PerkFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Perk extends Model
{
    /** @use HasFactory<PerkFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'loyalty_card_id',
        'stampNumber',
        'reward',
        'details',
        'color',
    ];

    public function loyaltyCard()
    {
        return $this->belongsTo(LoyaltyCard::class);
    }
}
