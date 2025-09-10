<?php

namespace App\Services;

use App\Models\Menu;

class MenuService
{
    public function getAll()
    {
        return Menu::orderBy('category')->orderBy('id')->get();
    }

    public function getAvailable()
    {
        return Menu::where('is_active', true)
                   ->where('quantity', '>', 0)
                   ->orderBy('category')
                   ->orderBy('id')
                   ->get();
    }

    public function getById($id)
    {
        return Menu::findOrFail($id);
    }

    public function create(array $data)
    {
        return Menu::create($data);
    }

    public function update($id, array $data)
    {
        $menu = Menu::findOrFail($id);
        $menu->update($data);
        return $menu;
    }

    public function delete($id)
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();
        return true;
    }

    public function decreaseQuantity($id, $amount = 1)
    {
        $menu = Menu::findOrFail($id);
        return $menu->decreaseQuantity($amount);
    }

    public function increaseQuantity($id, $amount = 1)
    {
        $menu = Menu::findOrFail($id);
        return $menu->increaseQuantity($amount);
    }

    public function checkQuantity($id, $amount = 1)
    {
        $menu = Menu::findOrFail($id);
        return $menu->hasEnoughQuantity($amount);
    }

    public function updateQuantity($id, $quantity)
    {
        $menu = Menu::findOrFail($id);
        $menu->quantity = $quantity;
        $menu->save();
        return $menu;
    }
}
