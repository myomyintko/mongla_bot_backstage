<?php

declare(strict_types=1);

namespace App\Telegraph\Handlers;

use DefStudio\Telegraph\Keyboard\Button;
use DefStudio\Telegraph\Keyboard\Keyboard;
use DefStudio\Telegraph\Keyboard\ReplyButton;
use DefStudio\Telegraph\Keyboard\ReplyKeyboard;

class KeyboardBuilder
{

    public static function backToMenu(?int $menuId = null): Keyboard
    {
        if ($menuId) {
            return Keyboard::make()->buttons([
                Button::make('🔙 Back to List')->action("menu_{$menuId}"),
            ]);
        }
        
        return Keyboard::make()->buttons([
            Button::make('🔙 Back to Menu')->action('show_menu'),
        ]);
    }

    public static function backToTrending(): Keyboard
    {
        return Keyboard::make()->buttons([
            Button::make('🔙 Back to Trending')->action('show_trending'),
        ]);
    }

    public static function searchOptions(): Keyboard
    {
        return Keyboard::make()->buttons([
            Button::make('📋 Main Menu')->action('show_menu'),
            Button::make('🔥 Trending Stores')->action('show_trending'),
        ]);
    }

    public static function helpBack(): Keyboard
    {
        return Keyboard::make()->buttons([
            Button::make('🔙 Back to Menu')->action('show_menu'),
        ]);
    }

    public static function storeList(array $stores, string $context = 'search'): Keyboard
    {
        $keyboard = Keyboard::make();

        // Group stores into pairs for two columns
        $storePairs = array_chunk($stores, 2);

        foreach ($storePairs as $pair) {
            $buttons = [];
            foreach ($pair as $store) {
                $buttons[] = Button::make($store['name'])->action("store_detail_{$store['id']}_from_{$context}");
            }
            $keyboard->row($buttons);
        }

        return $keyboard;
    }

    public static function trendingStores(array $stores): Keyboard
    {
        $keyboard = Keyboard::make();

        // Group stores into pairs for two columns
        $storePairs = array_chunk($stores, 2);

        foreach ($storePairs as $pair) {
            $buttons = [];
            foreach ($pair as $store) {
                $buttons[] = Button::make($store['name'])->action("store_detail_{$store['id']}_from_trending");
            }
            $keyboard->row($buttons);
        }

        // Add refresh button at the bottom
        $keyboard->button('🔄 Refresh')->action('refresh_trending');

        return $keyboard;
    }

    public static function quickAccessReplyKeyboard(array $menuButtons, bool $isRoot = true): ReplyKeyboard
    {
        $keyboard = ReplyKeyboard::make()
            ->resize()
            ->persistent();

        if (!$isRoot) {
            $keyboard->row([ReplyButton::make('🔙 Back')]);
        }

        $buttons = [];
        foreach ($menuButtons as $menuButton) {
            $buttons[] = ReplyButton::make($menuButton['name']);
        }

        // Add buttons in rows of 4
        $rows = array_chunk($buttons, 4);
        foreach ($rows as $row) {
            $keyboard->row($row);
        }

        return $keyboard;
    }

    public static function storesWithPagination(array $stores, array $pagination, int $menuButtonId, string $context = null): Keyboard
    {
        $keyboard = Keyboard::make();

        // Determine context for store detail buttons
        $storeContext = $context ?: "menu_{$menuButtonId}";

        // Group stores into pairs for two columns
        $storePairs = array_chunk($stores, 2);

        foreach ($storePairs as $pair) {
            $buttons = [];
            foreach ($pair as $store) {
                $buttons[] = Button::make($store['name'])->action("store_detail_{$store['id']}_from_{$storeContext}");
            }
            $keyboard->row($buttons);
        }

        // Add pagination buttons based on current page
        $paginationButtons = [];

        if ($pagination['current_page'] == 1) {
            // First page: show only Next button (full column)
            if ($pagination['has_next']) {
                $paginationButtons[] = Button::make('➡️ Next')->action("menu_stores_{$menuButtonId}_page_" . ($pagination['current_page'] + 1));
            }
        } elseif ($pagination['current_page'] == $pagination['total_pages']) {
            // Last page: show only Previous button (no Next)
            $paginationButtons[] = Button::make('⬅️ Previous')->action("menu_stores_{$menuButtonId}_page_" . ($pagination['current_page'] - 1));
        } else {
            // Middle pages: show both Previous and Next buttons
            $paginationButtons[] = Button::make('⬅️ Previous')->action("menu_stores_{$menuButtonId}_page_" . ($pagination['current_page'] - 1));
            $paginationButtons[] = Button::make('➡️ Next')->action("menu_stores_{$menuButtonId}_page_" . ($pagination['current_page'] + 1));
        }

        // Show pagination buttons only if there are any
        if (!empty($paginationButtons)) {
            $keyboard->row($paginationButtons);
        }

        return $keyboard;
    }
}
