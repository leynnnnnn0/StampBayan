<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('backup_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->unique()->constrained()->cascadeOnDelete();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->string('last_paymongo_payment_id')->nullable();
            $table->string('last_checkout_session_id')->nullable();
            $table->timestamp('seven_day_reminder_sent_at')->nullable();
            $table->timestamp('three_day_reminder_sent_at')->nullable();
            $table->timestamp('one_day_reminder_sent_at')->nullable();
            $table->timestamp('expired_reminder_sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backup_subscriptions');
    }
};
