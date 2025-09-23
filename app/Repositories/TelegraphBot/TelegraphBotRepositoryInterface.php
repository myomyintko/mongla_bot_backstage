<?php

declare(strict_types=1);

namespace App\Repositories\TelegraphBot;

use DefStudio\Telegraph\Models\TelegraphBot;
use Illuminate\Database\Eloquent\Collection;

interface TelegraphBotRepositoryInterface
{
    /**
     * Find a bot by token
     */
    public function findByToken(string $token): ?TelegraphBot;

    /**
     * Create a new bot
     */
    public function create(array $data): TelegraphBot;

    /**
     * Update a bot
     */
    public function update(TelegraphBot $bot, array $data): TelegraphBot;

    /**
     * Delete a bot
     */
    public function delete(TelegraphBot $bot): bool;

    /**
     * Get all bots with their chats
     */
    public function getAllWithChats(): Collection;

    /**
     * Get the configured bot from environment
     */
    public function getConfiguredBot(): ?TelegraphBot;
}
