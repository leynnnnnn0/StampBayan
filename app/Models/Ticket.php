<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'ticket_number',
        'subject',
        'description',
        'images',
        'status',
        'priority'
    ];

    protected $casts = [
        'images' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function replies()
    {
        return $this->hasMany(TicketReply::class)->orderBy('created_at', 'asc');
    }

    public function latestReply()
    {
        return $this->hasOne(TicketReply::class)->latestOfMany();
    }

    public static function generateTicketNumber()
    {
        do {
            $number = 'TKT-' . strtoupper(substr(md5(uniqid()), 0, 8));
        } while (self::where('ticket_number', $number)->exists());

        return $number;
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'open' => 'blue',
            'in_progress' => 'yellow',
            'resolved' => 'green',
            'closed' => 'gray',
            default => 'gray'
        };
    }

    public function getPriorityColorAttribute()
    {
        return match($this->priority) {
            'low' => 'gray',
            'medium' => 'blue',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'gray'
        };
    }
}
