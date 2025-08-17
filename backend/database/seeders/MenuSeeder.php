<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Menu;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menus = [
            // Đồ ăn
            ['name' => 'Gà rán', 'price' => 45000, 'category' => 'food', 'is_active' => true],
            ['name' => 'Khoai tây chiên', 'price' => 25000, 'category' => 'food', 'is_active' => true],
            ['name' => 'Bánh mì thịt', 'price' => 20000, 'category' => 'food', 'is_active' => true],
            ['name' => 'Mì xào', 'price' => 35000, 'category' => 'food', 'is_active' => true],
            ['name' => 'Phở', 'price' => 40000, 'category' => 'food', 'is_active' => true],
            
            // Đồ uống
            ['name' => 'Coca Cola', 'price' => 15000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Pepsi', 'price' => 15000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Nước cam', 'price' => 20000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Cà phê đen', 'price' => 18000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Cà phê sữa', 'price' => 20000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Trà đá', 'price' => 10000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Bia Tiger', 'price' => 25000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Bia Heineken', 'price' => 30000, 'category' => 'drink', 'is_active' => true],
        ];

        foreach ($menus as $menu) {
            Menu::create($menu);
        }
    }
}
