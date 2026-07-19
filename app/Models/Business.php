<?php

namespace App\Models;

use Database\Factories\BusinessFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Business extends Model
{
    /** @use HasFactory<BusinessFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'qr_token',
        'address',
        'contact_email',
        'contact_phone',
    ];

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }

    public function staffs()
    {
        return $this->hasMany(Staff::class);
    }

    public function loyaltyCards()
    {
        return $this->hasMany(LoyaltyCard::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function qr_code()
    {
        return $this->hasOne(QrCode::class);
    }

    public function stampCodes()
    {
        return $this->hasMany(StampCode::class);
    }

    public function backupSubscription()
    {
        return $this->hasOne(BackupSubscription::class);
    }

    public function backupPayments()
    {
        return $this->hasMany(BackupPayment::class);
    }

    public function hasActiveBackupPlan(): bool
    {
        $subscription = $this->relationLoaded('backupSubscription')
            ? $this->backupSubscription
            : $this->backupSubscription()->first();

        return $subscription?->isActive() ?? false;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($business) {
            $business->qr_token = Str::random(32);
        });
    }
}
