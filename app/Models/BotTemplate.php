<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Log;

class BotTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'content',
        'is_active',
        'variables',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'variables' => 'array',
    ];

    /**
     * Template types
     */
    const TYPE_WELCOME = 'welcome';
    const TYPE_HELP = 'help';
    const TYPE_TRENDING_STORES = 'trending_stores';
    const TYPE_STORE_LIST = 'store_list';
    const TYPE_STORE_DETAIL = 'store_detail';
    const TYPE_SEARCH_RESULTS = 'search_results';
    const TYPE_NO_RESULTS = 'no_results';
    const TYPE_ERROR = 'error';
    const TYPE_ADVERTISEMENT = 'advertisement';
    const TYPE_MENU_SELECTION = 'menu_selection';
    const TYPE_PAGINATION = 'pagination';


    /**
     * Scope a query to only include active templates
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include templates of a specific type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Get the default template for a specific type
     */
    public static function getDefaultTemplate(string $type): ?self
    {
        return self::active()->ofType($type)->first();
    }

    /**
     * Process template content with variables
     */
    public function processContent(array $variables = []): string
    {
        $content = $this->content;
        // Replace variables in the format {variable_name}
        foreach ($variables as $key => $value) {
            $content = str_replace("{{$key}}", $value, $content);
        }
        
        return $content;
    }

    /**
     * Get available template types
     */
    public static function getAvailableTypes(): array
    {
        return [
            self::TYPE_WELCOME => 'Welcome Message',
            self::TYPE_HELP => 'Help Message',
            self::TYPE_TRENDING_STORES => 'Trending Stores',
            self::TYPE_STORE_LIST => 'Store List',
            self::TYPE_STORE_DETAIL => 'Store Detail',
            self::TYPE_SEARCH_RESULTS => 'Search Results',
            self::TYPE_NO_RESULTS => 'No Results',
            self::TYPE_ERROR => 'Error Message',
            self::TYPE_ADVERTISEMENT => 'Advertisement',
            self::TYPE_MENU_SELECTION => 'Menu Selection',
            self::TYPE_PAGINATION => 'Pagination',
        ];
    }

    /**
     * Get default content for a template type
     */
    public static function getDefaultContent(string $type): string
    {
        return match ($type) {
            self::TYPE_WELCOME => "*🎉 Welcome {userFirstName}!*\n\nI'm {botName} and I can help you with various services. Use the menu below to get started.\n\n_User ID: {userId}_",
            self::TYPE_HELP => "🤖 *{botName} Help*\n\nAvailable commands:\n/start - Start the bot\n/help - Show this help message\n\nYou can also use the buttons below to navigate!",
            self::TYPE_TRENDING_STORES => "🔥 *Trending Stores*\n\nHere are the top stores you might be interested in:\n\n_Last updated: {currentTime}_",
            self::TYPE_STORE_LIST => "🔥 *Top Stores in {categoryName}*\n\nHere are the top stores in this category:",
            self::TYPE_STORE_DETAIL => "🏪 *{storeName}*\n\n{storeDescription}\n\n📍 {storeAddress}\n🕒 {storeHours}\n\n{storeStatus}",
            self::TYPE_SEARCH_RESULTS => "🔍 *Search Results for: {searchTerm}*\n\nHere are the stores matching your search:",
            self::TYPE_NO_RESULTS => "❌ No results found for your search.\n\nTry searching with different keywords or browse our categories.",
            self::TYPE_ERROR => "❌ An error occurred. Please try again later.\n\nIf the problem persists, contact support.",
            self::TYPE_ADVERTISEMENT => "📢 *{adTitle}*\n\nHi {userFirstName}! {adDescription}\n\n🏪 *{storeName}*\n📍 {storeAddress}\n🕒 {storeHours}\n\n_Sponsored Advertisement_",
            self::TYPE_MENU_SELECTION => "*Please select an option:*",
            self::TYPE_PAGINATION => "Page {currentPage} of {totalPages}",
            default => "Message content not available.",
        };
    }
}
