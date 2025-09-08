<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pin_messages', function (Blueprint $table) {
            $table->id();
            $table->string('media_url')->nullable();
            $table->integer('status')->default(1);
            $table->integer('sort')->nullable();
            $table->longText('content')->nullable();
            $table->string('btn_name')->nullable();
            $table->string('btn_link')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pin_messages');
    }
};
