<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Table;

class TableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tables = [
            ['name' => 'Bàn 1', 'status' => 'available', 'price_per_hour' => 100000],
            ['name' => 'Bàn 2', 'status' => 'available', 'price_per_hour' => 100000],
            ['name' => 'Bàn 3', 'status' => 'available', 'price_per_hour' => 100000],
            ['name' => 'Bàn 4', 'status' => 'available', 'price_per_hour' => 100000],
            ['name' => 'Bàn 5', 'status' => 'available', 'price_per_hour' => 100000],
            ['name' => 'Bàn 6', 'status' => 'available', 'price_per_hour' => 100000],
            ['name' => 'Bàn 7', 'status' => 'maintenance', 'price_per_hour' => 100000],
            ['name' => 'Bàn 8', 'status' => 'available', 'price_per_hour' => 100000],
        ];

        foreach ($tables as $table) {
            Table::create($table);
        }
    }
}
