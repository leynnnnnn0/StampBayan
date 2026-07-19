<?php

namespace App\Models;

use Database\Factories\SuggestionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Suggestion extends Model
{
    /** @use HasFactory<SuggestionFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'email',
        'suggestion',
    ];
}
