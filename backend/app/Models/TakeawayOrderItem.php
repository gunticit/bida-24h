<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TakeawayOrderItem extends Model
{
    protected $fillable = [
        'takeaway_order_id',
        'menu_id',
        'quantity',
        'price',
        'total',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function takeawayOrder(): BelongsTo
    {
        return $this->belongsTo(TakeawayOrder::class);
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    // Tự động tính total khi thay đổi quantity hoặc price
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($item) {
            $item->total = $item->quantity * $item->price;
        });
    }
}
