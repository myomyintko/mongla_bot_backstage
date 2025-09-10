<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class MediaLibrary extends Model
{
    protected $table = 'media_library';
    
    protected $fillable = [
        'original_name',
        'file_path',
        'file_size',
        'mime_type',
        'file_type',
        'width',
        'height',
        'duration',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'duration' => 'integer',
    ];

    /**
     * Get the full URL to the file
     */
    protected function url(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Construct the URL manually since we're storing files directly in upload paths
                $baseUrl = config('app.url');
                return $baseUrl . '/storage/' . $this->file_path;
            }
        );
    }

    /**
     * Get the file extension
     */
    protected function extension(): Attribute
    {
        return Attribute::make(
            get: fn () => pathinfo($this->original_name, PATHINFO_EXTENSION)
        );
    }

    /**
     * Get formatted file size
     */
    protected function formattedSize(): Attribute
    {
        return Attribute::make(
            get: function () {
                $bytes = $this->file_size;
                $units = ['B', 'KB', 'MB', 'GB'];
                
                for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
                    $bytes /= 1024;
                }
                
                return round($bytes, 2) . ' ' . $units[$i];
            }
        );
    }

    /**
     * Get formatted duration for videos
     */
    protected function formattedDuration(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->duration) return null;
                
                $hours = floor($this->duration / 3600);
                $minutes = floor(($this->duration % 3600) / 60);
                $seconds = $this->duration % 60;
                
                if ($hours > 0) {
                    return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
                }
                
                return sprintf('%d:%02d', $minutes, $seconds);
            }
        );
    }

    /**
     * Scope for filtering by file type
     */
    public function scopeOfType($query, $type)
    {
        if ($type === 'all') {
            return $query;
        }
        
        return $query->where('file_type', $type);
    }

    /**
     * Scope for searching by original name
     */
    public function scopeSearch($query, $search)
    {
        if (empty($search)) {
            return $query;
        }
        
        return $query->where('original_name', 'like', "%{$search}%");
    }
}
