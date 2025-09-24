<?php

declare(strict_types=1);

namespace App\Repositories\BotTemplate;

use App\Models\BotTemplate;
use Illuminate\Database\Eloquent\Collection;

interface BotTemplateRepositoryInterface
{
    public function getAll(): Collection;
    public function getById(int $id): ?BotTemplate;
    public function getByType(string $type): ?BotTemplate;
    public function getActiveTemplates(): Collection;
    public function create(array $data): BotTemplate;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function activate(int $id): bool;
    public function deactivate(int $id): bool;
}
