<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TakeawayOrder extends Model
{
    protected $fillable = [
        'customer_name',
        'customer_phone',
        'notes',
        'total_amount',
        'status',
        'order_date',
        'type',
    ];

    protected $casts = [
        'order_date' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(TakeawayOrderItem::class);
    }

    public function calculateTotal()
    {
        return $this->items->sum('total');
    }
}
