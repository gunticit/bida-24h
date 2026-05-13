<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Models\Table;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            $table->uuid('qr_token')->nullable()->unique()->after('name');
        });

        // Generate UUID for existing tables
        $tables = Table::all();
        foreach ($tables as $table) {
            $table->qr_token = Str::uuid()->toString();
            $table->save();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            $table->dropColumn('qr_token');
        });
    }
};
