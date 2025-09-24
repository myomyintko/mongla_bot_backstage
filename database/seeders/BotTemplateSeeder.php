<?php

namespace Database\Seeders;

use App\Models\BotTemplate;
use Illuminate\Database\Seeder;

class BotTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'type' => BotTemplate::TYPE_WELCOME,
                'content' => "*🎉 Welcome {userFirstName}!*\n\nI'm {botName} and I can help you with various services. Use the menu below to get started.\n\n_User ID: {userId}_",
                'is_active' => true,
                'variables' => ['userFirstName', 'userId', 'botName', 'currentTime', 'currentDate'],
            ],
            [
                'type' => BotTemplate::TYPE_HELP,
                'content' => "🤖 *{botName} Help*\n\nAvailable commands:\n/start - Start the bot\n/help - Show this help message\n\nYou can also use the buttons below to navigate!",
                'is_active' => true,
                'variables' => ['botName'],
            ],
            [
                'type' => BotTemplate::TYPE_TRENDING_STORES,
                'content' => "🔥 *Trending Stores*\n\nHere are the top stores you might be interested in:\n\n_Last updated: {currentTime}_",
                'is_active' => true,
                'variables' => ['currentTime', 'currentDate'],
            ],
            [
                'type' => BotTemplate::TYPE_STORE_LIST,
                'content' => "🔥 *Top Stores in {categoryName}*\n\nHere are the top stores in this category:",
                'is_active' => true,
                'variables' => ['categoryName', 'currentTime'],
            ],
            [
                'type' => BotTemplate::TYPE_STORE_DETAIL,
                'content' => "🏪 *{storeName}*\n\n{storeDescription}\n\n📍 {storeAddress}\n🕒 {storeHours}\n\n{storeStatus}",
                'is_active' => true,
                'variables' => ['storeName', 'storeDescription', 'storeAddress', 'storeHours', 'storeStatus'],
            ],
            [
                'type' => BotTemplate::TYPE_SEARCH_RESULTS,
                'content' => "🔍 *Search Results for: {searchTerm}*\n\nHere are the stores matching your search:",
                'is_active' => true,
                'variables' => ['searchTerm', 'resultCount'],
            ],
            [
                'type' => BotTemplate::TYPE_NO_RESULTS,
                'content' => "❌ No results found for your search.\n\nTry searching with different keywords or browse our categories.",
                'is_active' => true,
                'variables' => ['searchTerm'],
            ],
            [
                'type' => BotTemplate::TYPE_ERROR,
                'content' => "❌ An error occurred. Please try again later.\n\nIf the problem persists, contact support.",
                'is_active' => true,
                'variables' => ['errorMessage'],
            ],
            [
                'type' => BotTemplate::TYPE_ADVERTISEMENT,
                'content' => "📢 *{adTitle}*\n\nHi {userFirstName}! {adDescription}\n\n🏪 *{storeName}*\n📍 {storeAddress}\n🕒 {storeHours}\n\n_Sponsored Advertisement_",
                'is_active' => true,
                'variables' => ['adTitle', 'adDescription', 'storeName', 'storeAddress', 'storeHours', 'storeDescription', 'userFirstName', 'userMention', 'currentTime'],
            ],
            [
                'type' => BotTemplate::TYPE_MENU_SELECTION,
                'content' => "*Please select an option:*",
                'is_active' => true,
                'variables' => [],
            ],
            [
                'type' => BotTemplate::TYPE_PAGINATION,
                'content' => "Page {currentPage} of {totalPages}",
                'is_active' => true,
                'variables' => ['currentPage', 'totalPages'],
            ],
        ];

        foreach ($templates as $template) {
            BotTemplate::updateOrCreate(
                ['type' => $template['type']],
                $template
            );
        }

        $this->command->info('Bot templates seeded successfully!');
    }
}
