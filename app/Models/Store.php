<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Store extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'media_url',
        'menu_urls',
        'open_hour',
        'close_hour',
        'status',
        'address',
        'recommand',
        'sub_btns',
        'menu_button_id',
    ];

    protected $casts = [
        'recommand' => 'boolean',
        'sub_btns' => 'array',
        'menu_urls' => 'array',
        'description' => 'string',
    ];

    /**
     * Get the menu button that owns this store
     */
    public function menuButton(): BelongsTo
    {
        return $this->belongsTo(MenuButton::class);
    }

    /**
     * Scope to get only active stores
     */
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    /**
     * Scope to get only recommended stores
     */
    public function scopeRecommended($query)
    {
        return $query->where('recommand', true);
    }

    /**
     * Get the operating hours as a formatted string
     */
    public function getOperatingHoursAttribute(): string
    {
        if ($this->open_hour && $this->close_hour) {
            return $this->open_hour . ' - ' . $this->close_hour;
        }
        
        return 'Hours not specified';
    }
}
