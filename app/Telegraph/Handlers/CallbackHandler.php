<?php

declare(strict_types=1);

namespace App\Telegraph\Handlers;

use App\Services\TelegraphBot\TelegraphBotServiceInterface;
use App\Telegraph\Handlers\KeyboardBuilder;
use DefStudio\Telegraph\Keyboard\Button;
use DefStudio\Telegraph\Keyboard\Keyboard;
use DefStudio\Telegraph\Models\TelegraphBot;
use DefStudio\Telegraph\Models\TelegraphChat;
use DefStudio\Telegraph\DTO\CallbackQuery;
use Illuminate\Support\Facades\Log;

class CallbackHandler
{
    public function __construct(
        private TelegraphBotServiceInterface $telegraphBotService,
        private TelegraphChat $chat,
        private CallbackQuery $callbackQuery
    ) {}

    public function handleCallbackQuery(): void
    {
        $callbackData = $this->callbackQuery->data();
        
        // Convert Collection to string if needed
        if (is_object($callbackData) && method_exists($callbackData, 'toString')) {
            $callbackData = $callbackData->toString();
        } elseif (is_object($callbackData) && method_exists($callbackData, '__toString')) {
            $callbackData = (string) $callbackData;
        } elseif (is_array($callbackData) && isset($callbackData['action'])) {
            $callbackData = $callbackData['action'];
        }
        
        // Handle JSON string callback data
        if (is_string($callbackData) && str_starts_with($callbackData, '{"action":"')) {
            $decoded = json_decode($callbackData, true);
            if (isset($decoded['action'])) {
                $callbackData = $decoded['action'];
            }
        }

        Log::info('Handling callback query', ['data' => $callbackData]);

        // Handle different callback actions
        match (true) {
            str_starts_with($callbackData, 'store_detail_') => $this->handleStoreDetailWithContext($callbackData),
            str_starts_with($callbackData, 'store_menu_') => $this->handleStoreMenu($callbackData),
            str_starts_with($callbackData, 'menu_stores_') => $this->handleMenuStoresPagination($callbackData),
            str_starts_with($callbackData, 'back_to_store_') => $this->handleBackToStore($callbackData),
            str_starts_with($callbackData, 'back_to_') => $this->handleBackNavigation($callbackData),
            str_starts_with($callbackData, 'menu_') => $this->handleMenuButton($callbackData),
            $callbackData === 'show_trending' => $this->showTrendingStores(),
            $callbackData === 'refresh_trending' => $this->refreshTrendingStores(),
            $callbackData === 'show_stores' => $this->showTrendingStores(),
            default => $this->handleUnknownCallback($callbackData),
        };
    }

    protected function handleStoreDetailWithContext(string $callbackData): void
    {
        // Parse callback data: store_detail_{storeId}_from_{context}
        // Context can be: trending, menu_{menuId}, submenu_{menuId}
        if (preg_match('/store_detail_(\d+)_from_(.+)/', $callbackData, $matches)) {
            $storeId = (int) $matches[1];
            $context = $matches[2];
        } else {
            // Fallback to old format for backward compatibility
            $storeId = (int) str_replace('store_detail_', '', $callbackData);
            $context = $this->determineStoreSource();
        }

        Log::info('Store detail navigation with context', [
            'store_id' => $storeId,
            'context' => $context,
            'callback_data' => $callbackData
        ]);

        $this->showStoreDetail($storeId, $context);
    }

    protected function handleBackToStore(string $callbackData): void
    {
        // Parse callback data: back_to_store_{storeId}
        $storeId = (int) str_replace('back_to_store_', '', $callbackData);

        Log::info('Back to store navigation', [
            'store_id' => $storeId,
            'callback_data' => $callbackData
        ]);

        // Delete both the back button message and the media group
        $this->deleteCurrentMessage();

        // Also attempt to delete previous messages (media group)
        // We'll delete the last 5 messages to ensure we get the media group
        $currentMessageId = $this->callbackQuery->message()->id();
        for ($i = 1; $i <= 5; $i++) {
            try {
                $this->chat->deleteMessage($currentMessageId - $i)->send();
            } catch (\Exception $e) {
                // Ignore deletion failures for messages that don't exist or can't be deleted
                Log::debug('Could not delete message', [
                    'message_id' => $currentMessageId - $i,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Get the stored context for proper back navigation
        $source = $this->getStoredStoreContext($storeId);

        // Re-show the store detail with restored context
        $this->restoreStoreDetail($storeId, $source);
    }

    protected function handleBackNavigation(string $callbackData): void
    {
        // Parse callback data: back_to_{context}
        // Context can be: trending, menu_{menuId}, submenu_{menuId}
        $context = str_replace('back_to_', '', $callbackData);

        Log::info('Back navigation', [
            'context' => $context,
            'callback_data' => $callbackData
        ]);

        // Delete the current message (store detail)
        $this->deleteCurrentMessage();

        // Navigate back to the appropriate list
        if ($context === 'trending') {
            $this->showTrendingStores();
        } elseif (str_starts_with($context, 'menu_')) {
            $menuId = (int) str_replace('menu_', '', $context);
            $this->showMenuButtonStores($menuId);
        } elseif (str_starts_with($context, 'submenu_')) {
            $menuId = (int) str_replace('submenu_', '', $context);
            $this->showMenuButtonStores($menuId);
        }
    }

    protected function handleStoreMenu(string $callbackData): void
    {
        $storeId = (int) str_replace('store_menu_', '', $callbackData);

        // Delete the store detail message first
        $this->deleteCurrentMessage();

        $this->showStoreMenu($storeId);
    }

    /**
     * Determine the source of the store detail request
     */
    protected function determineStoreSource(): string
    {
        $messageText = $this->callbackQuery->message()->text();
        
        // Check if the message is from trending stores
        if (str_contains($messageText, 'Trending Stores') || str_contains($messageText, 'trending')) {
            return 'trending';
        }
        
        // Check if the message is from a specific menu
        if (preg_match('/Top Stores in (.+?)\*/', $messageText, $matches)) {
            $menuName = trim($matches[1]);
            // Remove any trailing asterisks that might be part of markdown
            $menuName = rtrim($menuName, '*');
            
            // Try to find the menu button ID by name
            $menuButton = \App\Models\MenuButton::where('name', $menuName)->first();
            if ($menuButton) {
                return "menu_{$menuButton->id}";
            }
        }
        
        // Alternative approach: check if message contains "Top Stores in" and try to extract menu name
        if (str_contains($messageText, 'Top Stores in')) {
            // Try to find menu button by checking if any menu name appears in the message
            // Use service to get all menu buttons
            $menuButtonsResponse = $this->telegraphBotService->getAllMenuButtons();
            if ($menuButtonsResponse['success'] && $menuButtonsResponse['data']) {
                foreach ($menuButtonsResponse['data'] as $menuButton) {
                    if (str_contains($messageText, $menuButton['name'])) {
                        return "menu_{$menuButton['id']}";
                    }
                }
            }
        }
        
        // Default to menu
        return 'menu';
    }

    protected function handleMenuButton(string $callbackData): void
    {
        $menuId = (int) str_replace('menu_', '', $callbackData);

        Log::info('Handling menu button navigation', [
            'callback_data' => $callbackData,
            'menu_id' => $menuId,
            'current_message_id' => $this->callbackQuery->message()->id()
        ]);

        // Always delete the current message when navigating back to list
        // This ensures clean navigation from store details to store lists
        $this->deleteCurrentMessage();

        $this->showMenuButtonStores($menuId);
    }

    protected function handleMenuStoresPagination(string $callbackData): void
    {
        // Parse: menu_stores_{menuButtonId}_page_{page}
        $pattern = '/menu_stores_(\d+)_page_(\d+)/';
        if (preg_match($pattern, $callbackData, $matches)) {
            $menuButtonId = (int) $matches[1];
            $page = (int) $matches[2];
            
            // Answer the callback query to remove loading state
            // $this->callbackQuery->answer();
            
            $this->showMenuButtonStores($menuButtonId, $page, true); // true = edit existing message
        }
    }

    protected function showStoreDetail(int $storeId, string $source = 'trending'): void
    {
        $messageId = $this->callbackQuery->message()->id();

        // Store the context in session for back navigation from menu
        $this->storeStoreContext($storeId, $source);

        // Delete the current message (the list)
        try {
            $this->chat->deleteMessage($messageId)->send();
        } catch (\Exception $e) {
            Log::error('Failed to delete message', ['error' => $e->getMessage()]);
        }

        $storeResponse = $this->telegraphBotService->getStoreDetails($storeId);

        if ($storeResponse['success'] && $storeResponse['data']) {
            $store = $storeResponse['data'];

            $userVariables = $this->getUserVariables();
            $userVariables['storeName'] = $store['name'];
            $userVariables['storeDescription'] = $store['description'] ?? '';
            $userVariables['storeAddress'] = $store['address'] ?? '';
            $userVariables['storeHours'] = ($store['open_hour'] && $store['close_hour']) ? "{$store['open_hour']} - {$store['close_hour']}" : '';
            $userVariables['storeCategory'] = $store['menu_button']['name'] ?? '';
            $userVariables['storeStatus'] = $store['status'] ? '✅ Active' : '❌ Inactive';
            $storeText = $this->telegraphBotService->getTemplateContent('store_detail', $userVariables);

            // Create keyboard with social media buttons
            $subBtns = $store['sub_btns'] ?? [];
            $backKeyboard = $this->createKeyboardWithSocialButtons($source, $storeId, $subBtns);

            // Send message with or without media
            $this->sendStoreMessage($store, $storeText, $backKeyboard, $storeId, $source);
        } else {
            $this->chat->message("❌ Store not found or error occurred.")
                ->keyboard(KeyboardBuilder::backToMenu())
                ->send();
        }
    }

    /**
     * Get appropriate back keyboard based on source
     */
    protected function getBackKeyboard(string $source): Keyboard
    {
        switch ($source) {
            case 'trending':
                return KeyboardBuilder::backToTrending();
            case 'menu':
                return KeyboardBuilder::backToMenu();
            default:
                // If source contains menu ID, create back to specific menu
                if (str_starts_with($source, 'menu_')) {
                    $menuId = (int) str_replace('menu_', '', $source);
                    return KeyboardBuilder::backToMenu($menuId);
                }
                return KeyboardBuilder::backToMenu();
        }
    }

    /**
     * Delete the current message (store detail)
     */
    protected function deleteCurrentMessage(): void
    {
        $messageId = $this->callbackQuery->message()->id();
        
        try {
            $this->chat->deleteMessage($messageId)->send();
        } catch (\Exception $e) {
            Log::error('Failed to delete current message', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Determine media type based on file extension
     */
    protected function getMediaType(string $mediaUrl): string
    {
        // Get file extension from URL
        $path = parse_url($mediaUrl, PHP_URL_PATH);
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        
        // Define video extensions
        $videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp', 'm4v'];
        
        // Check if it's a video
        if (in_array($extension, $videoExtensions)) {
            return 'video';
        }
        
        // Default to photo for images and unknown types
        return 'photo';
    }

    /**
     * Convert localhost URL to local file path
     */
    protected function convertUrlToLocalPath(string $mediaUrl): string
    {
        // Parse the URL to get the path
        $parsedUrl = parse_url($mediaUrl);
        $path = $parsedUrl['path'] ?? '';
        
        // Remove leading slash if present
        $path = ltrim($path, '/');
        
        // Convert to absolute path
        $localPath = public_path($path);
        
        return $localPath;
    }

    /**
     * Send store message with or without media
     */
    protected function sendStoreMessage(array $store, string $storeText, Keyboard $backKeyboard, int $storeId, string $source): void
    {
        if (empty($store['media_url'])) {
            // Send text message only
            $this->chat->message($storeText)
                ->keyboard($backKeyboard)
                ->send();
            return;
        }

        $mediaUrl = $store['media_url'];
        $mediaType = $this->getMediaType($mediaUrl);
        
        try {
            if (str_contains($mediaUrl, 'localhost')) {
                // Send local file
                $localFilePath = $this->convertUrlToLocalPath($mediaUrl);
                $this->sendMediaMessage($localFilePath, $storeText, $backKeyboard, $mediaType);
            } else {
                // Send remote URL
                $this->sendMediaMessage($mediaUrl, $storeText, $backKeyboard, $mediaType);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send media message, falling back to text', [
                'store_id' => $storeId,
                'error' => $e->getMessage()
            ]);
            
            // Fallback to text message
            $this->chat->message($storeText)
                ->keyboard($backKeyboard)
                ->send();
        }
    }

    /**
     * Send media message with fallback handling
     */
    protected function sendMediaMessage(string $media, string $text, Keyboard $keyboard, string $mediaType): void
    {
        try {
            if ($mediaType === 'video') {
                $this->chat->video($media)
                    ->message($text)
                    ->keyboard($keyboard)
                    ->send();
            } else {
                $this->chat->photo($media)
                    ->message($text)
                    ->keyboard($keyboard)
                    ->send();
            }
        } catch (\Exception $e) {
            // Try document as fallback
            $this->chat->document($media)
                ->message($text)
                ->keyboard($keyboard)
                ->send();
        }
    }

    /**
     * Prepare media group for menu URLs
     */
    protected function prepareMediaGroup(array $menuUrls, int $storeId): array
    {
        $mediaGroup = [];
        
        foreach ($menuUrls as $menuUrl) {
            $mediaType = $this->getMediaType($menuUrl);
            $media = str_contains($menuUrl, 'localhost') 
                ? $this->convertUrlToLocalPath($menuUrl)
                : $menuUrl;
            
            // Skip if local file doesn't exist
            if (str_contains($menuUrl, 'localhost') && !file_exists($media)) {
                continue;
            }
            
            $mediaGroup[] = [
                'type' => $mediaType,
                'media' => $media
            ];
        }
        
        return $mediaGroup;
    }

    /**
     * Create keyboard with both back button and menu button
     */
    protected function createKeyboardWithMenuButton(string $source, int $storeId): Keyboard
    {
        $buttons = [];

        // Get store details to determine the menu button for fallback navigation
        $storeResponse = $this->telegraphBotService->getStoreDetails($storeId);
        $store = null;
        if ($storeResponse['success'] && $storeResponse['data']) {
            $store = $storeResponse['data'];
        }

        // Add back button based on source
        switch ($source) {
            case 'trending':
                $buttons[] = Button::make('🔙 Back to Trending')->action('show_trending');
                break;
            default:
                // If source contains menu ID, create back to specific menu
                if (str_starts_with($source, 'menu_')) {
                    $menuId = (int) str_replace('menu_', '', $source);
                    $buttons[] = Button::make('🔙 Back to List')->action("menu_{$menuId}");
                } else {
                    // For any other case, try to use the store's menu button for navigation
                    if ($store && isset($store['menu_button']['id'])) {
                        $menuId = $store['menu_button']['id'];
                        $buttons[] = Button::make('🔙 Back to List')->action("menu_{$menuId}");
                    }
                    // If no menu button found, don't add back button (user navigates via main menu)
                }
                break;
        }
        
        // Add Menu button
        $buttons[] = Button::make('📋 Menu')->action("store_menu_{$storeId}");
        
        return Keyboard::make()->buttons($buttons);
    }

    protected function createKeyboardWithSocialButtons(string $source, int $storeId, array $subBtns = []): Keyboard
    {
        $allButtons = [];

        // Get store details to determine the menu button for fallback navigation
        $storeResponse = $this->telegraphBotService->getStoreDetails($storeId);
        $store = null;
        if ($storeResponse['success'] && $storeResponse['data']) {
            $store = $storeResponse['data'];
        }

        // Add back button based on context
        if ($source === 'trending') {
            $allButtons[] = Button::make('🔙 Back to Trending')->action('back_to_trending');
            Log::info('Added back to trending button', ['store_id' => $storeId]);
        } elseif (str_starts_with($source, 'menu_') || str_starts_with($source, 'submenu_')) {
            $allButtons[] = Button::make('🔙 Back to List')->action("back_to_{$source}");
            Log::info('Added back to menu button', ['store_id' => $storeId, 'source' => $source]);
        } else {
            // For any other case, try to use the store's menu button for navigation
            if ($store && isset($store['menu_button']['id'])) {
                $menuId = $store['menu_button']['id'];
                $allButtons[] = Button::make('🔙 Back to List')->action("back_to_menu_{$menuId}");
                Log::info('Added fallback back button using store menu', ['store_id' => $storeId, 'menu_id' => $menuId, 'source' => $source]);
            } else {
                Log::info('No back button added - no menu button found', ['store_id' => $storeId, 'source' => $source, 'store_has_menu_button' => $store ? isset($store['menu_button']['id']) : false]);
            }
        }
        
        // Add Menu button if store has menu_urls (reuse the store data we already fetched)
        if ($store && !empty($store['menu_urls']) && is_array($store['menu_urls']) && count($store['menu_urls']) > 0) {
            $allButtons[] = Button::make('📋 Menu')->action("store_menu_{$storeId}");
        }
        
        // Add social media buttons
        if (!empty($subBtns) && is_array($subBtns)) {
            foreach ($subBtns as $socialBtn) {
                if (!empty($socialBtn['url']) && !empty($socialBtn['label'])) {
                    $buttonText = $socialBtn['label'];
                    $buttonUrl = $this->buildSocialMediaUrl($socialBtn['platform'], $socialBtn['url']);
                    
                    if ($buttonUrl) {
                        $allButtons[] = Button::make($buttonText)->url($buttonUrl);
                    }
                }
            }
        }
        
        // Group all buttons into pairs for two columns
        $keyboard = Keyboard::make();
        if (!empty($allButtons)) {
            $buttonPairs = array_chunk($allButtons, 2);
            foreach ($buttonPairs as $pair) {
                $keyboard->row($pair);
            }
        }
        
        return $keyboard;
    }


    protected function buildSocialMediaUrl(string $platform, string $username): ?string
    {
        // Remove @ symbol if present
        $username = ltrim($username, '@');
        
        if (empty($username)) {
            return null;
        }
        
        return match ($platform) {
            'telegram' => "https://t.me/{$username}",
            'wechat' => "https://weixin.qq.com/r/{$username}",
            'tiktok' => "https://www.tiktok.com/@{$username}",
            'facebook' => "https://facebook.com/{$username}",
            'instagram' => "https://instagram.com/{$username}",
            'twitter' => "https://twitter.com/{$username}",
            'whatsapp' => "https://wa.me/{$username}",
            default => null,
        };
    }

    /**
     * Show store menu using media group
     */
    protected function showStoreMenu(int $storeId): void
    {
        // Get store details
        $storeResponse = $this->telegraphBotService->getStoreDetails($storeId);

        if (!$storeResponse['success'] || !$storeResponse['data']) {
            $this->chat->message("❌ Store not found or error occurred.")
                ->keyboard(KeyboardBuilder::backToMenu())
                ->send();
            return;
        }

        $store = $storeResponse['data'];

        // Check if store has menu_urls
        if (empty($store['menu_urls']) || !is_array($store['menu_urls']) || count($store['menu_urls']) === 0) {
            $this->chat->message("❌ No menu available for this store.")
                ->keyboard(KeyboardBuilder::backToMenu())
                ->send();
            return;
        }

        try {
            $mediaGroup = $this->prepareMediaGroup($store['menu_urls'], $storeId);

            if (empty($mediaGroup)) {
                $this->chat->message("❌ No valid menu files found.")
                    ->keyboard(KeyboardBuilder::backToMenu())
                    ->send();
                return;
            }

            // Send media group first
            $this->chat->mediaGroup($mediaGroup)->send();

            // Then send a message with back button
            $backKeyboard = Keyboard::make()->buttons([
                Button::make('🔙 Back to Store')->action("back_to_store_{$storeId}")
            ]);

            $this->chat->message("📋 *Store Menu*\n\nUse the back button below to return to store details.")
                ->keyboard($backKeyboard)
                ->send();

        } catch (\Exception $e) {
            Log::error('Failed to send store menu', [
                'store_id' => $storeId,
                'error' => $e->getMessage()
            ]);

            $this->chat->message("❌ Failed to load menu. Please try again later.")
                ->keyboard(KeyboardBuilder::backToMenu())
                ->send();
        }
    }

    protected function showMenuButtonStores(int $menuButtonId, int $page = 1, bool $editMessage = false): void
    {
        // Get menu button details first
        $menuResponse = $this->telegraphBotService->getMenuButtonDetails($menuButtonId);

        if (!$menuResponse['success'] || !$menuResponse['data']) {
            if ($editMessage) {
                $this->chat->edit($this->callbackQuery->message()->id())
                    ->message("❌ Menu not found.")
                    ->keyboard(KeyboardBuilder::backToMenu())
                    ->send();
            } else {
                $this->chat->message("❌ Menu not found.")
                    ->keyboard(KeyboardBuilder::backToMenu())
                    ->send();
            }
            return;
        }

        $menuButton = $menuResponse['data'];

        // Check if template is enabled - if so, do nothing yet
        if ($menuButton['enable_template'] ?? false) {
            return;
        }

        // Determine if this is a submenu by checking if it has a parent
        $context = isset($menuButton['parent_id']) && $menuButton['parent_id']
            ? "submenu_{$menuButtonId}"
            : "menu_{$menuButtonId}";

        // Template is disabled, proceed with store list logic
        // Get stores for this menu button (including children if any)
        $storesResponse = $this->telegraphBotService->getStoresByMenuButtonWithChildren($menuButtonId, $page, 10);

        if ($storesResponse['success'] && !empty($storesResponse['data'])) {
            $stores = $storesResponse['data'];
            $pagination = $storesResponse['pagination'];

            $userVariables = $this->getUserVariables();
            $userVariables['categoryName'] = $menuButton['name'];
            $menuText = $this->telegraphBotService->getTemplateContent('store_list', $userVariables);

            Log::info('Template processed for store list with stores', [
                'menuButtonName' => $menuButton['name'],
                'templateVariables' => $userVariables,
                'processedText' => $menuText
            ]);

            if ($editMessage) {
                $this->chat->edit($this->callbackQuery->message()->id())
                    ->message($menuText)
                    ->keyboard(KeyboardBuilder::storesWithPagination($stores, $pagination, $menuButtonId, $context))
                    ->send();
            } else {
                $this->chat->message($menuText)
                    ->keyboard(KeyboardBuilder::storesWithPagination($stores, $pagination, $menuButtonId, $context))
                    ->send();
            }
        } else {
            $userVariables = $this->getUserVariables();
            $userVariables['categoryName'] = $menuButton['name'];
            $menuText = $this->telegraphBotService->getTemplateContent('store_list', $userVariables);
            $menuText .= "\n\nNo stores found in this category at the moment.";

            Log::info('Template processed for store list with no stores', [
                'menuButtonName' => $menuButton['name'],
                'templateVariables' => $userVariables,
                'processedText' => $menuText
            ]);

            if ($editMessage) {
                $this->chat->edit($this->callbackQuery->message()->id())
                    ->message($menuText)
                    ->keyboard(KeyboardBuilder::backToMenu())
                    ->send();
            } else {
                $this->chat->message($menuText)
                    ->keyboard(KeyboardBuilder::backToMenu())
                    ->send();
            }
        }
    }

    protected function showTrendingStores(): void
    {
        // Delete the current message (store detail)
        $this->deleteCurrentMessage();

        $trendingResponse = $this->telegraphBotService->getTrendingStores();

        if ($trendingResponse['success'] && !empty($trendingResponse['data'])) {
            $trendingStores = $trendingResponse['data'];
            $userVariables = $this->getUserVariables();
            $trendingText = $this->telegraphBotService->getTemplateContent('trending_stores', $userVariables);

            $this->chat->message($trendingText)
                ->keyboard(KeyboardBuilder::trendingStores($trendingStores))
                ->send();
        } else {
            $this->chat->message("No trending stores available at the moment.")
                ->keyboard(KeyboardBuilder::backToMenu())
                ->send();
        }
    }



    protected function refreshTrendingStores(): void
    {
        // Get fresh trending stores data
        $trendingResponse = $this->telegraphBotService->getTrendingStores();

        if ($trendingResponse['success'] && !empty($trendingResponse['data'])) {
            $trendingStores = $trendingResponse['data'];
            $userVariables = $this->getUserVariables();
            $messageText = $this->telegraphBotService->getTemplateContent('trending_stores', $userVariables);

            $this->chat->edit($this->callbackQuery->message()->id())
                ->message($messageText)
                ->keyboard(KeyboardBuilder::trendingStores($trendingStores))
                ->send();
        } else {
            $this->chat->edit($this->callbackQuery->message()->id())
                ->message("🔥 *Trending Stores*\n\nNo trending stores available at the moment.")
                ->keyboard(KeyboardBuilder::backToMenu())
                ->send();
        }
    }

    protected function handleUnknownCallback(string $callbackData): void
    {
        Log::warning('Unknown callback data received', ['data' => $callbackData]);

        $this->chat->message("❌ Unknown action. Please try again.")
            ->keyboard(KeyboardBuilder::backToMenu())
            ->send();
    }

    /**
     * Get user variables for template processing
     */
    protected function getUserVariables(): array
    {
        $user = $this->callbackQuery->from();
        $bot = $this->telegraphBotService->getConfiguredBot();
        
        return [
            'userId' => (string) $user->id(),
            'userFirstName' => $user->firstName() ?? '',
            'userLastName' => $user->lastName() ?? '',
            'userUsername' => $user->username() ?? '',
            'userFullName' => trim(($user->firstName() ?? '') . ' ' . ($user->lastName() ?? '')),
            'userMention' => $user->username() ? '@' . $user->username() : ($user->firstName() ?? 'User'),
            'userLanguageCode' => $user->languageCode() ?? 'en',
            'userIsBot' => $user->isBot() ? 'true' : 'false',
            'userIsPremium' => $user->isPremium() ? 'true' : 'false',
            'botName' => $bot ? $bot->name : 'Bot',
            'botUsername' => $bot ? '@' . $bot->username : '@bot',
        ];
    }

    /**
     * Store store context in session for back navigation
     */
    protected function storeStoreContext(int $storeId, string $source): void
    {
        $chatId = $this->chat->chat_id;
        $key = "store_context_{$chatId}_{$storeId}";

        // Store in cache for 1 hour
        cache()->put($key, $source, now()->addHour());

        Log::info('Stored store context', [
            'store_id' => $storeId,
            'source' => $source,
            'chat_id' => $chatId
        ]);
    }

    /**
     * Get stored store context from session
     */
    protected function getStoredStoreContext(int $storeId): string
    {
        $chatId = $this->chat->chat_id;
        $key = "store_context_{$chatId}_{$storeId}";

        $source = cache()->get($key, 'trending'); // Default to trending

        Log::info('Retrieved store context', [
            'store_id' => $storeId,
            'source' => $source,
            'chat_id' => $chatId
        ]);

        return $source;
    }

    /**
     * Restore store detail without deleting previous message
     */
    protected function restoreStoreDetail(int $storeId, string $source): void
    {
        $storeResponse = $this->telegraphBotService->getStoreDetails($storeId);

        if ($storeResponse['success'] && $storeResponse['data']) {
            $store = $storeResponse['data'];

            $userVariables = $this->getUserVariables();
            $userVariables['storeName'] = $store['name'];
            $userVariables['storeDescription'] = $store['description'] ?? '';
            $userVariables['storeAddress'] = $store['address'] ?? '';
            $userVariables['storeHours'] = ($store['open_hour'] && $store['close_hour']) ? "{$store['open_hour']} - {$store['close_hour']}" : '';
            $userVariables['storeCategory'] = $store['menu_button']['name'] ?? '';
            $userVariables['storeStatus'] = $store['status'] ? '✅ Active' : '❌ Inactive';
            $storeText = $this->telegraphBotService->getTemplateContent('store_detail', $userVariables);

            // Create keyboard with social media buttons
            $subBtns = $store['sub_btns'] ?? [];
            $backKeyboard = $this->createKeyboardWithSocialButtons($source, $storeId, $subBtns);

            // Send message with or without media
            $this->sendStoreMessage($store, $storeText, $backKeyboard, $storeId, $source);
        } else {
            $this->chat->message("❌ Store not found or error occurred.")
                ->keyboard(KeyboardBuilder::backToMenu())
                ->send();
        }
    }
}