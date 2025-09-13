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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->date('expense_date');
            $table->decimal('amount', 15, 0);
            $table->text('description')->nullable();
            $table->string('category')->nullable(); // danh mục chi phí (optional)
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // người tạo
            $table->timestamps();
            
            // Index cho tìm kiếm theo ngày
            $table->index('expense_date');
            $table->index(['expense_date', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
