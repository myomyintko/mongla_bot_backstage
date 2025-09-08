<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'frequency_cap_minutes' => 'integer',
        'status' => 'integer',
    ];

    /**
     * Get the store that owns the advertisement
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
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
}
