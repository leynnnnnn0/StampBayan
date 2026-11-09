<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prize_wheels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('title')->default('Spin & Win');
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        Schema::create('prize_wheel_prizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prize_wheel_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('image_path')->nullable();
            $table->decimal('probability', 5, 2);
            $table->string('color', 7)->default('#F8B83E');
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prize_wheel_prizes');
        Schema::dropIfExists('prize_wheels');
    }
};
