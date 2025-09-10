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
            ['name' => 'Mực khô', 'price' => 100000, 'quantity' => 50, 'category' => 'food', 'is_active' => true],
            ['name' => 'Bò khô', 'price' => 80000, 'quantity' => 30, 'category' => 'food', 'is_active' => true],
            ['name' => 'Đậu phộng', 'price' => 25000, 'quantity' => 100, 'category' => 'food', 'is_active' => true],
            ['name' => 'Bánh Mix', 'price' => 20000, 'quantity' => 80, 'category' => 'food', 'is_active' => true],
            ['name' => 'Bắp', 'price' => 15000, 'quantity' => 60, 'category' => 'food', 'is_active' => true],
            ['name' => 'Cơm cháy', 'price' => 15000, 'quantity' => 40, 'category' => 'food', 'is_active' => true],
            ['name' => 'Oishi', 'price' => 10000, 'quantity' => 120, 'category' => 'food', 'is_active' => true],
            ['name' => 'Mì tôm', 'price' => 20000, 'quantity' => 70, 'category' => 'food', 'is_active' => true],
            ['name' => 'Trái cây', 'price' => 60000, 'quantity' => 20, 'category' => 'food', 'is_active' => true],
            
            // Đồ uống
            ['name' => 'Nước ngọt', 'price' => 15000, 'quantity' => 200, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Pocari', 'price' => 21000, 'quantity' => 150, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Bò Húc', 'price' => 20000, 'quantity' => 180, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Cà phê đen', 'price' => 18000, 'quantity' => 100, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Cà phê sữa', 'price' => 20000, 'quantity' => 100, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Tiger bạc cao', 'price' => 23000, 'quantity' => 120, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Tiger bạc lùn', 'price' => 17000, 'quantity' => 120, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Tiger nâu lon', 'price' => 20000, 'quantity' => 100, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Larue bạc', 'price' => 17000, 'quantity' => 120, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Larue xanh', 'price' => 15000, 'quantity' => 120, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Nước suối', 'price' => 10000, 'quantity' => 300, 'category' => 'drink', 'is_active' => true],
            
            // Thuốc lá
            ['name' => '555 Việt', 'price' => 42000, 'quantity' => 50, 'category' => 'tobacco', 'is_active' => true],
            ['name' => 'Thuốc', 'price' => 35000, 'quantity' => 60, 'category' => 'tobacco', 'is_active' => true],
            ['name' => 'Ngựa Trắng', 'price' => 30000, 'quantity' => 40, 'category' => 'tobacco', 'is_active' => true],
            ['name' => 'Mèo lớn', 'price' => 29000, 'quantity' => 45, 'category' => 'tobacco', 'is_active' => true],
            ['name' => 'Mèo nhỏ', 'price' => 20000, 'quantity' => 50, 'category' => 'tobacco', 'is_active' => true],
            ['name' => 'Sài gòn bạc', 'price' => 19000, 'quantity' => 55, 'category' => 'tobacco', 'is_active' => true],
            ['name' => 'Yet Việt', 'price' => 17000, 'quantity' => 60, 'category' => 'tobacco', 'is_active' => true],
            ['name' => 'Ngựa đen', 'price' => 15000, 'quantity' => 65, 'category' => 'tobacco', 'is_active' => true],
            ['name' => '555 The', 'price' => 23000, 'quantity' => 40, 'category' => 'tobacco', 'is_active' => true],
            ['name' => '555 Bạc', 'price' => 31000, 'quantity' => 35, 'category' => 'tobacco', 'is_active' => true],
            
            // Mang về
            ['name' => 'Thuốc', 'price' => 30000, 'quantity' => 80, 'category' => 'takeaway', 'is_active' => true],
            ['name' => '555 Việt', 'price' => 37000, 'quantity' => 60, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Ngựa Trắng', 'price' => 27000, 'quantity' => 70, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Mèo Lớn', 'price' => 25000, 'quantity' => 75, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Mèo nhỏ', 'price' => 16000, 'quantity' => 80, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Sài gòn bạc', 'price' => 15000, 'quantity' => 85, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Thăng long', 'price' => 14000, 'quantity' => 90, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Yet Việt', 'price' => 13000, 'quantity' => 95, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Ngựa đen', 'price' => 11000, 'quantity' => 100, 'category' => 'takeaway', 'is_active' => true],
            ['name' => '555 the', 'price' => 19000, 'quantity' => 70, 'category' => 'takeaway', 'is_active' => true],
            ['name' => '555 bạc', 'price' => 27000, 'quantity' => 65, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Nước Ngọt', 'price' => 10000, 'quantity' => 250, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Pocari', 'price' => 15000, 'quantity' => 200, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Bò Húc', 'price' => 13000, 'quantity' => 220, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Tiger bạc cao', 'price' => 18000, 'quantity' => 150, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Tiger bạc lùn', 'price' => 12500, 'quantity' => 150, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Tiger nâu cao', 'price' => 15500, 'quantity' => 140, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Larue bạc', 'price' => 12500, 'quantity' => 150, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Larue xanh', 'price' => 12000, 'quantity' => 150, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Nước suối', 'price' => 5000, 'quantity' => 400, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Đậu phộng', 'price' => 15000, 'quantity' => 120, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Bánh Mix', 'price' => 12000, 'quantity' => 100, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Cơm cháy', 'price' => 10000, 'quantity' => 80, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Mực khô', 'price' => 70000, 'quantity' => 30, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Bò Khô', 'price' => 60000, 'quantity' => 25, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Bắp', 'price' => 10000, 'quantity' => 90, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Oishi', 'price' => 5000, 'quantity' => 150, 'category' => 'takeaway', 'is_active' => true],
        ];

        foreach ($menus as $menu) {
            Menu::create($menu);
        }
    }
}
