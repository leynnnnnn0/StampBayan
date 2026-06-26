<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerkClaim extends Model
{
    protected $fillable = [
        'customer_id', 
        'loyalty_card_id',
        'perk_id',
        'stamps_at_claim',
        'is_redeemed',
        'redeemed_at',
        'redeemed_by',
        'remarks',
    ];

    protected $casts = [
        'claimed_at' => 'datetime',
        'redeemed_at' => 'datetime',
        'is_redeemed' => 'boolean',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function loyalty_card()
    {
        return $this->belongsTo(LoyaltyCard::class);
    }

    public function perk()
    {
        return $this->belongsTo(Perk::class);
    }

    public function redeemed_by()
    {
        return $this->belongsTo(User::class, 'redeemed_by');
    }
}
