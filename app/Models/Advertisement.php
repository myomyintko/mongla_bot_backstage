<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Advertisement extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'title',
        'status',
        'description',
        'media_url',
        'start_date',
        'end_date',
        'frequency_cap_minutes',
        'sub_btns',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'frequency_cap_minutes' => 'integer',
        'status' => 'integer',
        'sub_btns' => 'array',
    ];

    /**
     * Get the store that owns the advertisement
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Get the advertisement sends
     */
    public function sends(): HasMany
    {
        return $this->hasMany(AdvertisementSend::class);
    }

    /**
     * Scope a query to only include active advertisements
     */
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    /**
     * Scope a query to only include inactive advertisements
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 0);
    }

    /**
     * Scope a query to only include advertisements within date range
     */
    public function scopeWithinDateRange($query, $startDate = null, $endDate = null)
    {
        if ($startDate) {
            $query->where('start_date', '<=', $startDate);
        }
        
        if ($endDate) {
            $query->where('end_date', '>=', $endDate);
        }
        
        return $query;
    }

    /**
     * Check if advertisement is currently running
     */
    public function isCurrentlyRunning(): bool
    {
        $now = now();
        
        // Check if advertisement is active
        if ($this->status !== 1) {
            return false;
        }
        
        // Check if we're within the date range
        if ($this->start_date && $now->lt($this->start_date)) {
            return false;
        }
        
        if ($this->end_date && $now->gt($this->end_date)) {
            return false;
        }
        
        return true;
    }
}
