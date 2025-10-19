<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'table_id',
        'request_ip',
        'user_agent',
        'status',
        'requested_at',
        'handled_at',
        'handled_by',
        'admin_notes',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'handled_at' => 'datetime',
    ];

    // Relationships
    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function handledBy()
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('requested_at', today());
    }
}