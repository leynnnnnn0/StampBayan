<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompletedLoyaltyCard extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'loyalty_card_id',
        'stamps_collected',
        'completed_at',
        'card_cycle',
        'stamps_data',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'stamps_data' => 'array', // Automatically cast JSON to array
    ];

    /**
     * Get the customer that owns the completed card.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the loyalty card associated with this completion.
     */
    public function loyaltyCard()
    {
        return $this->belongsTo(LoyaltyCard::class);
    }

    /**
     * Scope to get completions for a specific customer
     */
    public function scopeForCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    /**
     * Scope to get completions for a specific loyalty card
     */
    public function scopeForLoyaltyCard($query, $loyaltyCardId)
    {
        return $query->where('loyalty_card_id', $loyaltyCardId);
    }

    /**
     * Scope to order by most recent completions
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('completed_at', 'desc');
    }
}
