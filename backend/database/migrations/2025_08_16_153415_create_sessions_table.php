<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('table_id')->constrained('tables')->onDelete('cascade');
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable(); // Nullable khi đang chơi
            $table->integer('total_time')->nullable(); // Tính bằng phút
            $table->decimal('hour_price', 10, 0); // Đơn giá tại thời điểm bắt đầu
            $table->decimal('total_money_table', 10, 0)->default(0); // Tiền bàn
            $table->decimal('total_money_food', 10, 0)->default(0); // Tiền đồ ăn uống
            $table->decimal('total_money', 10, 0)->default(0); // Tổng cộng
            $table->enum('status', ['playing', 'finished', 'canceled'])->default('playing');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_sessions');
    }
};
