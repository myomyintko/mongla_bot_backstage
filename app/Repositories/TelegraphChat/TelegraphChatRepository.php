<?php

declare(strict_types=1);

namespace App\Repositories\TelegraphChat;

use DefStudio\Telegraph\Models\TelegraphChat;
use Illuminate\Support\Collection;

class TelegraphChatRepository implements TelegraphChatRepositoryInterface
{
    /**
     * Get all chats for a specific bot
     */
    public function getChatsByBotId(int $botId): Collection
    {
        return TelegraphChat::where('telegraph_bot_id', $botId)->get();
    }

    /**
     * Get all chat IDs for a specific bot
     */
    public function getChatIdsByBotId(int $botId): Collection
    {
        return TelegraphChat::where('telegraph_bot_id', $botId)
            ->pluck('chat_id');
    }

    /**
     * Get chat by chat ID and bot ID
     */
    public function getChatByChatIdAndBotId(string $chatId, int $botId): ?object
    {
        return TelegraphChat::where('chat_id', $chatId)
            ->where('telegraph_bot_id', $botId)
            ->first();
    }

    /**
     * Create or update a chat
     */
    public function createOrUpdateChat(array $data): object
    {
        return TelegraphChat::updateOrCreate(
            [
                'chat_id' => $data['chat_id'],
                'telegraph_bot_id' => $data['telegraph_bot_id']
            ],
            $data
        );
    }

    /**
     * Get total count of chats for a bot
     */
    public function getChatCountByBotId(int $botId): int
    {
        return TelegraphChat::where('telegraph_bot_id', $botId)->count();
    }
}

