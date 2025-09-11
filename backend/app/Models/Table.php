<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'status',
        'price_per_hour',
    ];

    protected $casts = [
        'price_per_hour' => 'decimal:2',
    ];

    // Relationships
    public function sessions()
    {
        return $this->hasMany(GameSession::class);
    }

    public function activeSession()
    {
        return $this->hasOne(GameSession::class)->where('status', 'playing');
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopePlaying($query)
    {
        return $query->where('status', 'playing');
    }

    public function scopeMaintenance($query)
    {
        return $query->where('status', 'maintenance');
    }
}
