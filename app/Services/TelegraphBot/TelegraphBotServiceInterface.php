<?php

declare(strict_types=1);

namespace App\Services\TelegraphBot;

use DefStudio\Telegraph\Models\TelegraphBot;
use DefStudio\Telegraph\Keyboard\Keyboard;

interface TelegraphBotServiceInterface
{
    /**
     * Get the configured bot from environment variables
     */
    public function getConfiguredBot(): ?TelegraphBot;

    /**
     * Get bot information from Telegram API
     */
    public function getBotInfo(): array;

    /**
     * Register webhook for the configured bot
     */
    public function registerWebhook(): array;

    /**
     * Unregister webhook for the configured bot
     */
    public function unregisterWebhook(): array;

    /**
     * Send test message from the configured bot
     */
    public function sendTestMessage(): array;

    /**
     * Process incoming webhook update
     */
    public function processWebhookUpdate(array $update): array;

    /**
     * Handle incoming message
     */
    public function handleMessage(array $message): array;

    /**
     * Handle incoming callback query (inline keyboard button clicks)
     */
    public function handleCallbackQuery(array $callbackQuery): array;

    /**
     * Handle incoming command
     */
    public function handleCommand(string $command, array $message): array;

    /**
     * Send message to a specific chat
     */
    public function sendMessage(string $chatId, string $text, array $options = []): array;

    /**
     * Send message with inline keyboard
     */
    public function sendMessageWithKeyboard(string $chatId, string $text, array $keyboard, array $options = []): array;

    /**
     * Edit message text
     */
    public function editMessageText(string $chatId, int $messageId, string $text, array $options = []): array;

    /**
     * Answer callback query
     */
    public function answerCallbackQuery(string $callbackQueryId, string $text = '', bool $showAlert = false): array;

    /**
     * Get bot commands
     */
    public function getBotCommands(): array;

    /**
     * Set bot commands
     */
    public function setBotCommands(array $commands): array;

    /**
     * Send media (photo/video/document) to a chat
     */
    public function sendMedia(string $chatId, string $media, string $mediaType, string $caption = '', Keyboard $socialKeyboard): array;

    /**
     * Get current webhook domain
     */
    public function getWebhookDomain(): array;

    /**
     * Get current webhook info from Telegram
     */
    public function getWebhookInfo(): array;

    /**
     * Get trending stores for bot display
     */
    public function getTrendingStores(): array;

    /**
     * Get root menu buttons for persistent keyboard
     */
    public function getRootMenuButtons(): array;

    /**
     * Get store details by ID
     */
    public function getStoreDetails(int $storeId): array;

    /**
     * Get menu button details by ID
     */
    public function getMenuButtonDetails(int $menuButtonId): array;

    /**
     * Search stores by keyword
     */
    public function searchStores(string $keyword): array;

    /**
     * Get stores by menu button ID with pagination
     */
    public function getStoresByMenuButton(int $menuButtonId, int $page = 1, int $perPage = 10): array;

    /**
     * Get stores by menu button ID including all sub-menu stores with pagination
     */
    public function getStoresByMenuButtonWithChildren(int $menuButtonId, int $page = 1, int $perPage = 10): array;

    /**
     * Get all menu buttons (root and child)
     */
    public function getAllMenuButtons(): array;

    /**
     * Get processed template content with variables
     */
    public function getTemplateContent(string $type, array $variables = []): string;
}
