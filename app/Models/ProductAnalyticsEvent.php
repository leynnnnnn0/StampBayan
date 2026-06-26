<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductAnalyticsEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_name',
        'session_id',
        'user_id',
        'business_id',
        'customer_id',
        'staff_id',
        'path',
        'url',
        'referrer',
        'page_title',
        'element_label',
        'duration_ms',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
