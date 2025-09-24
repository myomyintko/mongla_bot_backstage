<?php

declare(strict_types=1);

namespace App\Repositories\TelegraphBot;

use DefStudio\Telegraph\Models\TelegraphBot;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class TelegraphBotRepository implements TelegraphBotRepositoryInterface
{
    public function findByToken(string $token): ?TelegraphBot
    {
        return TelegraphBot::where('token', $token)->first();
    }

    public function create(array $data): TelegraphBot
    {
        return TelegraphBot::create($data);
    }

    public function update(TelegraphBot $bot, array $data): TelegraphBot
    {
        $bot->update($data);
        return $bot->fresh();
    }

    public function delete(TelegraphBot $bot): bool
    {
        return $bot->delete();
    }

    public function getAllWithChats(): Collection
    {
        return TelegraphBot::with('chats')->get();
    }

    public function getConfiguredBot(): ?TelegraphBot
    {
        $token = config('telegraph.bot.token');
        $name = config('telegraph.bot.name');
        $username = config('telegraph.bot.username');

        if (!$token) {
            Log::warning('TELEGRAM_BOT_TOKEN is not configured in environment variables');
            return null;
        }

        // Try to find existing bot in database
        $bot = TelegraphBot::where('token', $token)->first();

        if (!$bot) {
            // Create bot from environment configuration
            $bot = TelegraphBot::create([
                'token' => $token,
                'name' => $name,
                'username' => $username,
            ]);

            Log::info('Created bot from environment configuration', [
                'bot_id' => $bot->id,
                'name' => $bot->name,
            ]);
        }

        return $bot;
    }
}
