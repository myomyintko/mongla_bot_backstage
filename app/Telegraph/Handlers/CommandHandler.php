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
use Illuminate\Support\Stringable;

class CommandHandler
{
    public function __construct(
        private TelegraphBotServiceInterface $telegraphBotService,
        private TelegraphChat $chat,
        private Message $message
    ) {
    }

    public function handleCommand(Stringable $text): void
    {
        $command = trim($text->toString(), '/');

        match ($command) {
            'start' => $this->handleStartCommand(),
            'help' => $this->handleHelpCommand(),
            default => $this->handleUnknownCommand($text),
        };
    }

    protected function handleStartCommand(): void
    {
        $userVariables = $this->getUserVariables();
        $welcomeText = $this->telegraphBotService->getTemplateContent('welcome', $userVariables);

        Log::info('Sending welcome message', [
            'user_variables' => $userVariables,
            'welcome_text' => $welcomeText
        ]);

        $welcomeResponse = $this->chat->message($welcomeText)->send();
        Log::info('Welcome message sent', [
            'response' => $welcomeResponse->json() ?? 'No response data'
        ]);

        // Show trending stores
        $this->showTrendingStores();

        // Set up persistent menu buttons
        $this->setupPersistentMenu();
    }

    protected function handleHelpCommand(): void
    {
        $userVariables = $this->getUserVariables();
        $helpText = $this->telegraphBotService->getTemplateContent('help', $userVariables);

        $helpResponse = $this->chat->message($helpText)
            ->keyboard(KeyboardBuilder::helpBack())
            ->send();
        Log::info('Help message sent', [
            'response' => $helpResponse->json() ?? 'No response data'
        ]);
    }

    protected function handleUnknownCommand(Stringable $text): void
    {
        $unknownResponse = $this->chat->message("❌ Unknown command: /{$text}\n\nUse /help to see available commands.")
            ->send();
        Log::info('Unknown command message sent', [
            'response' => $unknownResponse->json() ?? 'No response data'
        ]);
    }

    protected function showTrendingStores(): void
    {
        $trendingResponse = $this->telegraphBotService->getTrendingStores();

        try {
            if ($trendingResponse['success'] && !empty($trendingResponse['data'])) {
                $trendingStores = $trendingResponse['data'];
                $userVariables = $this->getUserVariables();
                $messageText = $this->telegraphBotService->getTemplateContent('trending_stores', $userVariables);

                $trendingResponse = $this->chat->message($messageText)
                    ->keyboard(KeyboardBuilder::trendingStores($trendingStores))
                    ->send();
                    
                Log::info('Trending stores message sent', [
                    'response' => $trendingResponse->json() ?? 'No response data'
                ]);
            } else {
                $trendingResponse = $this->chat->message("No trending stores available at the moment.")
                    ->keyboard(KeyboardBuilder::backToMenu())
                    ->send();
                    
                Log::info('No trending stores message sent', [
                    'response' => $trendingResponse->json() ?? 'No response data'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send trending stores message', [
                'error' => $e->getMessage()
            ]);
        }
    }

    protected function setupPersistentMenu(): void
    {
        try {
            $menuResponse = $this->telegraphBotService->getRootMenuButtons();

            if ($menuResponse['success'] && !empty($menuResponse['data'])) {
                $rootMenuButtons = $menuResponse['data'];
                $menuText = $this->telegraphBotService->getTemplateContent('menu_selection');

                $menuResponse = $this->chat->message($menuText)
                    ->replyKeyboard(KeyboardBuilder::quickAccessReplyKeyboard($rootMenuButtons))
                    ->send();
                    
                Log::info('Persistent menu message sent', [
                    'response' => $menuResponse->json() ?? 'No response data'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send persistent menu message', [
                'error' => $e->getMessage()
            ]);
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