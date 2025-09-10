<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'quantity',
        'category',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFood($query)
    {
        return $query->where('category', 'food');
    }

    public function scopeDrink($query)
    {
        return $query->where('category', 'drink');
    }

    public function scopeTobacco($query)
    {
        return $query->where('category', 'tobacco');
    }

    public function scopeTakeaway($query)
    {
        return $query->where('category', 'takeaway');
    }

    // Methods
    public function decreaseQuantity($amount = 1)
    {
        if ($this->quantity >= $amount) {
            $this->quantity -= $amount;
            $this->save();
            return true;
        }
        return false;
    }

    public function increaseQuantity($amount = 1)
    {
        $this->quantity += $amount;
        $this->save();
        return true;
    }

    public function hasEnoughQuantity($amount = 1)
    {
        return $this->quantity >= $amount;
    }
}
