<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuButton extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'name',
        'button_type',
        'sort',
        'status',
        'media_url',
        'enable_template',
        'template_content',
        'sub_btns',
    ];

    protected $casts = [
        'enable_template' => 'boolean',
        'sub_btns' => 'array',
        'template_content' => 'string',
    ];

    /**
     * Get the parent menu button
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(MenuButton::class, 'parent_id');
    }

    /**
     * Get the child menu buttons
     */
    public function children(): HasMany
    {
        return $this->hasMany(MenuButton::class, 'parent_id')->orderBy('sort');
    }

    /**
     * Get all descendants recursively
     */
    public function descendants(): HasMany
    {
        return $this->children()->with('descendants');
    }

    /**
     * Scope to get only root menu buttons (no parent)
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope to get only active menu buttons
     */
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    /**
     * Get the full hierarchy path
     */
    public function getPathAttribute(): string
    {
        $path = collect([$this->name]);
        $parent = $this->parent;

        while ($parent) {
            $path->prepend($parent->name);
            $parent = $parent->parent;
        }

        return $path->implode(' > ');
    }
}
