<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BackupSubscription extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'activated_at' => 'datetime',
            'expires_at' => 'datetime',
            'seven_day_reminder_sent_at' => 'datetime',
            'three_day_reminder_sent_at' => 'datetime',
            'one_day_reminder_sent_at' => 'datetime',
            'expired_reminder_sent_at' => 'datetime',
        ];
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function isActive(): bool
    {
        return $this->expires_at?->isFuture() ?? false;
    }
}
