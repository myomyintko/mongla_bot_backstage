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
        Schema::create('menu_buttons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('menu_buttons')->nullOnDelete();
            $table->string('name')->nullable();
            $table->string('button_type')->default('main_menu');
            $table->integer('sort')->nullable();
            $table->integer('status')->nullable();
            $table->string('media_url')->nullable();
            $table->boolean('enable_template')->default(0);
            $table->longText('template_content')->nullable();
            $table->longText('sub_btns')->nullable();
            $table->timestamps();

            $table->index('id');
            $table->index('parent_id');
            $table->index('button_type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_buttons');
    }
};
