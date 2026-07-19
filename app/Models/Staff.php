<?php

namespace App\Models;

use Database\Factories\StaffFactory;
use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Notifications\Notifiable;

class Staff extends Model implements AuthenticatableContract, AuthorizableContract
{
    /** @use HasFactory<StaffFactory> */
    use Authenticatable, Authorizable, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'business_id',
        'branch',
        'username',
        'password',
        'remarks',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $table = 'staff';

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}

// test
