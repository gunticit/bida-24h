<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'expense_date',
        'amount',
        'description',
        'category',
        'user_id',
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount' => 'decimal:2',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeToday($query)
    {
        return $query->whereDate('expense_date', today());
    }

    public function scopeThisMonth($query)
    {
        return $query->whereYear('expense_date', now()->year)
                    ->whereMonth('expense_date', now()->month);
    }

    public function scopeThisYear($query)
    {
        return $query->whereYear('expense_date', now()->year);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('expense_date', [$startDate, $endDate]);
    }
}
