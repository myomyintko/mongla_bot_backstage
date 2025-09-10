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
        Schema::create('media_library', function (Blueprint $table) {
            $table->id();
            $table->string('original_name');
            $table->string('file_path');
            $table->bigInteger('file_size'); // in bytes
            $table->string('mime_type');
            $table->enum('file_type', ['image', 'video', 'document', 'other'])->default('other');
            $table->integer('width')->nullable(); // for images/videos
            $table->integer('height')->nullable(); // for images/videos
            $table->integer('duration')->nullable(); // for videos, in seconds
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['file_type']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_library');
    }
};
