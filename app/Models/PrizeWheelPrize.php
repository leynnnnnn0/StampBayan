<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrizeWheelPrize extends Model
{
    protected $fillable = [
        'prize_wheel_id',
        'name',
        'image_path',
        'probability',
        'color',
        'sort_order',
    ];

    protected $casts = [
        'probability' => 'decimal:2',
    ];

    public function prizeWheel()
    {
        return $this->belongsTo(PrizeWheel::class);
    }
}
