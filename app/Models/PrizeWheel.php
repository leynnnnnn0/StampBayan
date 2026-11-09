<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrizeWheel extends Model
{
    protected $fillable = [
        'business_id',
        'title',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function prizes()
    {
        return $this->hasMany(PrizeWheelPrize::class)->orderBy('sort_order');
    }
}
