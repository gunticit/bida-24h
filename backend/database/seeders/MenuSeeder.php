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
            ['name' => 'Mực khô', 'price' => 100000, 'category' => 'food', 'is_active' => true],
            ['name' => 'Bò khô', 'price' => 80000, 'category' => 'food', 'is_active' => true],
            ['name' => 'Đậu phộng', 'price' => 25000, 'category' => 'food', 'is_active' => true],
            ['name' => 'Bánh Mix', 'price' => 20000, 'category' => 'food', 'is_active' => true],
            ['name' => 'Bắp', 'price' => 15000, 'category' => 'food', 'is_active' => true],
            ['name' => 'Cơm cháy', 'price' => 15000, 'category' => 'food', 'is_active' => true],
            ['name' => 'Oishi', 'price' => 10000, 'category' => 'food', 'is_active' => true],
            ['name' => 'Mì tôm', 'price' => 20000, 'category' => 'food', 'is_active' => true],
            ['name' => 'Trái cây', 'price' => 60000, 'category' => 'food', 'is_active' => true],
            
            // Đồ uống
            ['name' => 'Nước ngọt', 'price' => 15000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Pocari', 'price' => 21000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Bò Húc', 'price' => 20000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Cà phê đen', 'price' => 18000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Cà phê sữa', 'price' => 20000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Tiger bạc cao', 'price' => 23000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Tiger bạc lùn', 'price' => 17000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Tiger nâu lon', 'price' => 20000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Larue bạc', 'price' => 17000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Larue xanh', 'price' => 15000, 'category' => 'drink', 'is_active' => true],
            ['name' => 'Nước suối', 'price' => 10000, 'category' => 'drink', 'is_active' => true],
            
            // Thuốc lá
            ['name' => '555 Việt', 'price' => 42000, 'category' => 'tobacco', 'is_active' => true],
            ['name' => 'Thuốc', 'price' => 35000, 'category' => 'tobacco', 'is_active' => true],
            ['name' => 'Ngựa Trắng', 'price' => 30000, 'category' => 'tobacco', 'is_active' => true],
            ['name' => 'Mèo lớn', 'price' => 29000, 'category' => 'tobacco', 'is_active' => true],
            ['name' => 'Mèo nhỏ', 'price' => 20000, 'category' => 'tobacco', 'is_active' => true],
            ['name' => 'Sài gòn bạc', 'price' => 19000, 'category' => 'tobacco', 'is_active' => true],
            ['name' => 'Yet Việt', 'price' => 17000, 'category' => 'tobacco', 'is_active' => true],
            ['name' => 'Ngựa đen', 'price' => 15000, 'category' => 'tobacco', 'is_active' => true],
            ['name' => '555 The', 'price' => 23000, 'category' => 'tobacco', 'is_active' => true],
            ['name' => '555 Bạc', 'price' => 31000, 'category' => 'tobacco', 'is_active' => true],
            
            // Mang về
            ['name' => 'Thuốc', 'price' => 30000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => '555 Việt', 'price' => 37000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Ngựa Trắng', 'price' => 27000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Mèo Lớn', 'price' => 25000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Mèo nhỏ', 'price' => 16000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Sài gòn bạc', 'price' => 15000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Thăng long', 'price' => 14000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Yet Việt', 'price' => 13000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Ngựa đen', 'price' => 11000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => '555 the', 'price' => 19000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => '555 bạc', 'price' => 27000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Nước Ngọt', 'price' => 10000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Pocari', 'price' => 15000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Bò Húc', 'price' => 13000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Tiger bạc cao', 'price' => 18000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Tiger bạc lùn', 'price' => 12500, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Tiger nâu cao', 'price' => 15500, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Larue bạc', 'price' => 12500, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Larue xanh', 'price' => 12000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Nước suối', 'price' => 5000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Đậu phộng', 'price' => 15000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Bánh Mix', 'price' => 12000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Cơm cháy', 'price' => 10000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Mực khô', 'price' => 70000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Bò Khô', 'price' => 60000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Bắp', 'price' => 10000, 'category' => 'takeaway', 'is_active' => true],
            ['name' => 'Oishi', 'price' => 5000, 'category' => 'takeaway', 'is_active' => true],
        ];

        foreach ($menus as $menu) {
            Menu::create($menu);
        }
    }
}
