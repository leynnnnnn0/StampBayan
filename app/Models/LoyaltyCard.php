<?php

namespace App\Models;

use Carbon\Carbon;
use Database\Factories\LoyaltyCardFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LoyaltyCard extends Model
{
    /** @use HasFactory<LoyaltyCardFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'business_id',
        'logo',
        'name',
        'heading',
        'subheading',
        'stampsNeeded',
        'mechanics',
        'backgroundColor',
        'textColor',
        'valid_until',
        'stampColor',
        'stampFilledColor',
        'stampEmptyColor',
        'stampImage',
        'backgroundImage',
        'footer',
        'stampShape',

    ];

    protected $appends = [
        'is_near_expiry_date',
        'is_expired',
        'valid_until_formatted',
    ];

    public function getValidUntilFormattedAttribute()
    {
        return Carbon::parse($this->valid_until)->format('F d, Y');
    }

    public function getIsNearExpiryDateAttribute()
    {
        if (! $this->valid_until) {
            return false;
        }

        $expiryDate = Carbon::parse($this->valid_until);
        $sevenDaysBeforeExpiry = $expiryDate->copy()->subDays(7);

        return now()->greaterThanOrEqualTo($sevenDaysBeforeExpiry) && now()->lessThan($expiryDate);
    }

    public function getIsExpiredAttribute()
    {
        if (! $this->valid_until) {
            return false;
        }

        return now()->greaterThanOrEqualTo(Carbon::parse($this->valid_until));
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function perks()
    {
        return $this->hasMany(Perk::class);
    }

    public function stamp_codes()
    {
        return $this->hasMany(StampCode::class);
    }
}
