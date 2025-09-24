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
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->longText('description')->nullable();
            $table->string('media_url')->nullable();
            $table->json('menu_urls')->nullable();
            $table->string('open_hour')->nullable();
            $table->string('close_hour')->nullable();
            $table->integer('status')->nullable();
            $table->string('address')->nullable();
            $table->boolean('recommand')->default(0);
            $table->longText('sub_btns')->nullable();
            $table->foreignId('menu_button_id')->nullable()->constrained('menu_buttons')->nullOnDelete();
            $table->timestamps();

            $table->index('status', 'stores_status_index');
            $table->index('recommand', 'stores_recommand_index');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
