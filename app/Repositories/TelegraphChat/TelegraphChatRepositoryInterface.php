<?php

declare(strict_types=1);

namespace App\Repositories\TelegraphChat;

use Illuminate\Support\Collection;

interface TelegraphChatRepositoryInterface
{
    /**
     * Get all chats for a specific bot
     */
    public function getChatsByBotId(int $botId): Collection;

    /**
     * Get all chat IDs for a specific bot
     */
    public function getChatIdsByBotId(int $botId): Collection;

    /**
     * Get chat by chat ID and bot ID
     */
    public function getChatByChatIdAndBotId(string $chatId, int $botId): ?object;

    /**
     * Create or update a chat
     */
    public function createOrUpdateChat(array $data): object;

    /**
     * Get total count of chats for a bot
     */
    public function getChatCountByBotId(int $botId): int;
}
