<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('backup_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('reference_number')->unique();
            $table->string('checkout_session_id')->nullable()->unique();
            $table->string('paymongo_payment_id')->nullable();
            $table->string('webhook_event_id')->nullable()->unique();
            $table->unsignedInteger('amount')->default(9900);
            $table->string('status')->default('pending')->index();
            $table->text('checkout_url')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backup_payments');
    }
};
