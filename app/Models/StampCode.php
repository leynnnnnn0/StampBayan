<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StampCode extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'user_id',
        'loyalty_card_id',
        'business_id',
        'customer_id',
        'code',
        'used_at',
        'is_expired',
        'is_offline_code',
        'number_of_stamps',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function loyalty_card()
    {
        return $this->belongsTo(LoyaltyCard::class);
    }

    public function completed_loyalty_card()
    {
        return $this->hasOne(CompletedLoyaltyCard::class);
    }

}
