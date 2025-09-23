<?php

declare(strict_types=1);

namespace App\Telegraph\Handlers;

use App\Services\TelegraphBot\TelegraphBotServiceInterface;
use App\Telegraph\Handlers\KeyboardBuilder;
use DefStudio\Telegraph\Keyboard\Button;
use DefStudio\Telegraph\Keyboard\Keyboard;
use DefStudio\Telegraph\Models\TelegraphChat;
use DefStudio\Telegraph\DTO\Message;
use Illuminate\Support\Facades\Log;

class MessageHandler
{
    public function __construct(
        private TelegraphBotServiceInterface $telegraphBotService,
        private TelegraphChat $chat,
        private Message $message
    ) {}

    public function handleRegularMessage(string $text): void
    {
        // Handle reply keyboard button presses first
        if ($this->isReplyKeyboardButton($text)) {
            $this->handleReplyKeyboardButton($text);
            return;
        }

        // Handle search functionality
        if (strlen(trim($text)) >= 2) {
            $this->searchStores($text);
        } else {
            $response = "🔍 *Search Stores*\n\n" .
                       "Type at least 2 characters to search for stores.\n\n" .
                       "You can search by:\n" .
                       "• Store name\n" .
                       "• Description\n" .
                       "• Address";
            
            $this->chat->message($response)
                ->keyboard(KeyboardBuilder::searchOptions())
                ->send();
        }
    }

    protected function isReplyKeyboardButton(string $text): bool
    {
        // Check default reply keyboard buttons
        $defaultButtons = [
            '🏪 Stores',
            '📢 Advertisements', 
            '📌 Pin Messages',
            'ℹ️ Help',
            '🔙 Back'
        ];

        if (in_array($text, $defaultButtons)) {
            return true;
        }

        // Check if it's a custom menu button from database (root level)
        $menuResponse = $this->telegraphBotService->getRootMenuButtons();
        if ($menuResponse['success'] && !empty($menuResponse['data'])) {
            $menuButtons = array_column($menuResponse['data'], 'name');
            if (in_array($text, $menuButtons)) {
                return true;
            }
        }

        // Check if it's a sub menu button from any parent menu
        if ($this->isSubMenuButton($text)) {
            return true;
        }

        return false;
    }

    protected function isSubMenuButton(string $text): bool
    {
        // Get all root menu buttons and check their children
        $menuResponse = $this->telegraphBotService->getRootMenuButtons();
        if ($menuResponse['success'] && !empty($menuResponse['data'])) {
            foreach ($menuResponse['data'] as $menuButton) {
                $subMenuResponse = $this->telegraphBotService->getMenuButtonDetails($menuButton['id']);
                if ($subMenuResponse['success'] && !empty($subMenuResponse['data']['children'])) {
                    $subMenuNames = array_column($subMenuResponse['data']['children'], 'name');
                    if (in_array($text, $subMenuNames)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    protected function handleReplyKeyboardButton(string $text): void
    {
        // Handle default buttons
        match ($text) {
            '🏪 Stores' => $this->showStores(),
            '📢 Advertisements' => $this->showAdvertisements(),
            '📌 Pin Messages' => $this->showPinMessages(),
            'ℹ️ Help' => $this->showHelp(),
            '🔙 Back' => $this->goBackToMainMenu(),
            default => $this->handleCustomMenuButton($text),
        };
    }

    protected function handleCustomMenuButton(string $text): void
    {
        // First check if it's a root menu button
        $menuResponse = $this->telegraphBotService->getRootMenuButtons();
        if ($menuResponse['success'] && !empty($menuResponse['data'])) {
            foreach ($menuResponse['data'] as $menuButton) {
                if ($menuButton['name'] === $text) {
                    $this->showMenuButtonDetail($menuButton['id']);
                    return;
                }
            }
        }

        // Then check if it's a sub menu button
        $subMenuButtonId = $this->findSubMenuButtonId($text);
        if ($subMenuButtonId) {
            $this->showMenuButtonDetail($subMenuButtonId);
            return;
        }

        // If not found, treat as search
        $this->searchStores($text);
    }

    protected function findSubMenuButtonId(string $text): ?int
    {
        $menuResponse = $this->telegraphBotService->getRootMenuButtons();
        if ($menuResponse['success'] && !empty($menuResponse['data'])) {
            foreach ($menuResponse['data'] as $menuButton) {
                $subMenuResponse = $this->telegraphBotService->getMenuButtonDetails($menuButton['id']);
                if ($subMenuResponse['success'] && !empty($subMenuResponse['data']['children'])) {
                    foreach ($subMenuResponse['data']['children'] as $child) {
                        if ($child['name'] === $text) {
                            return $child['id'];
                        }
                    }
                }
            }
        }
        return null;
    }

    protected function showMenuButtonDetail(int $menuButtonId): void
    {
        // Get menu button details first
        $menuResponse = $this->telegraphBotService->getMenuButtonDetails($menuButtonId);

        if (!$menuResponse['success'] || !$menuResponse['data']) {
            $this->chat->message("❌ Menu not found.")
                ->keyboard(KeyboardBuilder::backToMenu())
                ->send();
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

        // Get stores for this menu button (including children if any)
        $storesResponse = $this->telegraphBotService->getStoresByMenuButtonWithChildren($menuButtonId, 1, 10);

        if ($storesResponse['success'] && !empty($storesResponse['data'])) {
            $stores = $storesResponse['data'];
            $pagination = $storesResponse['pagination'];

            $userVariables = $this->getUserVariables();
            $userVariables['categoryName'] = $menuButton['name'];
            $menuText = $this->telegraphBotService->getTemplateContent('store_list', $userVariables);

            $this->chat->message($menuText)
                ->keyboard(KeyboardBuilder::storesWithPagination($stores, $pagination, $menuButtonId, $context))
                ->send();
        } else {
            $userVariables = $this->getUserVariables();
            $userVariables['categoryName'] = $menuButton['name'];
            $menuText = $this->telegraphBotService->getTemplateContent('store_list', $userVariables) . "\n\nNo stores found in this category at the moment.";

            $this->chat->message($menuText)
                ->keyboard(KeyboardBuilder::backToMenu())
                ->send();
        }

        // If has child menu, update the quick access reply keyboard with submenu data
        if (!empty($menuButton['children'])) {
            $userVariables = $this->getUserVariables();
            $menuText = $this->telegraphBotService->getTemplateContent('menu_selection', $userVariables);
            $this->chat->message($menuText)
                ->replyKeyboard(KeyboardBuilder::quickAccessReplyKeyboard($menuButton['children'], false))
                ->send();
        }
    }

    protected function showStores(): void
    {
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

    protected function showAdvertisements(): void
    {
        $this->chat->message("*Advertisements*\n\n*Advertisement feature coming soon!*")
            ->keyboard(KeyboardBuilder::backToMenu())
            ->send();
    }

    protected function showPinMessages(): void
    {
        $this->chat->message("*Pin Messages*\n\n*Pin messages feature coming soon!*")
            ->keyboard(KeyboardBuilder::backToMenu())
            ->send();
    }

    protected function showHelp(): void
    {
        $helpText = "*Mongolia Bot Help*\n\n*" .
                   "This bot helps you manage:\n" .
                   "• 🏪 Stores information\n" .
                   "• 📢 Advertisements\n" .
                   "• 📌 Pin messages\n\n" .
                   "Use the buttons to navigate through the features!";

        $this->chat->message($helpText)
            ->keyboard(KeyboardBuilder::helpBack())
            ->send();
    }

    protected function goBackToMainMenu(): void
    {
        $menuResponse = $this->telegraphBotService->getRootMenuButtons();
        
        if ($menuResponse['success'] && !empty($menuResponse['data'])) {
            $rootMenuButtons = $menuResponse['data'];

            $this->chat->message("*Please select an option:*")
                ->replyKeyboard(KeyboardBuilder::quickAccessReplyKeyboard($rootMenuButtons))
                ->send();
        }
    }

    protected function searchStores(string $keyword): void
    {
        $searchResponse = $this->telegraphBotService->searchStores($keyword);

        if ($searchResponse['success'] && !empty($searchResponse['data'])) {
            $stores = $searchResponse['data'];

            $userVariables = $this->getUserVariables();
            $userVariables['searchTerm'] = $keyword;
            $userVariables['resultCount'] = (string) count($stores);
            $searchText = $this->telegraphBotService->getTemplateContent('search_results', $userVariables);

            $this->chat->message($searchText)
                ->keyboard(KeyboardBuilder::storeList($stores, 'search'))
                ->send();
        } else {
            $userVariables = $this->getUserVariables();
            $userVariables['searchTerm'] = $keyword;
            $noResultsText = $this->telegraphBotService->getTemplateContent('no_results', $userVariables);

            $this->chat->message($noResultsText)
                ->keyboard(KeyboardBuilder::searchOptions())
                ->send();
        }
    }

    /**
     * Get user variables for template processing
     */
    protected function getUserVariables(): array
    {
        $user = $this->message->from();
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
}