<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameSession extends Model
{
    use HasFactory;

    protected $table = 'game_sessions';

    protected $fillable = [
        'table_id',
        'start_time',
        'end_time',
        'total_time',
        'hour_price',
        'total_money_table',
        'total_money_food',
        'total_money',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'hour_price' => 'decimal:2',
        'total_money_table' => 'decimal:2',
        'total_money_food' => 'decimal:2',
        'total_money' => 'decimal:2',
    ];

    // Relationships
    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'session_id');
    }

    // Scopes
    public function scopePlaying($query)
    {
        return $query->where('status', 'playing');
    }

    public function scopeFinished($query)
    {
        return $query->where('status', 'finished');
    }

    public function scopeCanceled($query)
    {
        return $query->where('status', 'canceled');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('start_time', today());
    }

    public function scopeTodayOrPlaying($query)
    {
        return $query->where(function($q) {
            $q->whereDate('start_time', today())
              ->orWhere('status', 'playing');
        });
    }

    public function scopePlayingOrLast7Days($query)
    {
        return $query->where(function($q) {
            $q->where('status', 'playing')
              ->orWhere('start_time', '>=', today()->subDays(7));
        });
    }

    // Methods
    public function calculateTotalTime()
    {
        if ($this->end_time) {
            $this->total_time = $this->start_time->diffInMinutes($this->end_time);
            $this->save();
        }
        return $this->total_time;
    }

    public function calculateTableMoney()
    {
        if ($this->total_time) {
            $hours = $this->total_time / 60;
            $this->total_money_table = $hours * $this->hour_price;
            $this->save();
        }
        return $this->total_money_table;
    }

    public function calculateTotalMoney()
    {
        $this->total_money = $this->total_money_table + $this->total_money_food;
        $this->save();
        return $this->total_money;
    }
}
