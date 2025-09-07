<?php

namespace App\Services;

use App\Models\Menu;

class MenuService
{
    public function getAll()
    {
        return Menu::orderBy('category')->orderBy('id')->get();
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
}
