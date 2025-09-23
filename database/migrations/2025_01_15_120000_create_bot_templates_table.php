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
        Schema::create('bot_templates', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // welcome, help, trending_stores, etc.
            $table->text('content');
            $table->boolean('is_active')->default(true);
            $table->json('variables')->nullable(); // Available variables for this template
            $table->timestamps();
            
            $table->index(['type', 'is_active']);
            $table->unique(['type', 'is_active']); // Only one active template per type
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bot_templates');
    }
};
