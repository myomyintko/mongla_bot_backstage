<?php

declare(strict_types=1);

namespace App\Services\BotTemplate;

use App\Models\BotTemplate;
use Illuminate\Database\Eloquent\Collection;

interface BotTemplateServiceInterface
{
    public function getAllTemplates(): Collection;
    public function getActiveTemplates(): Collection;
    public function getTemplateById(int $id): ?BotTemplate;
    public function getTemplateByType(string $type): ?BotTemplate;
    public function createTemplate(array $data): BotTemplate;
    public function updateTemplate(int $id, array $data): bool;
    public function deleteTemplate(int $id): bool;
    public function activateTemplate(int $id): bool;
    public function deactivateTemplate(int $id): bool;
    public function getProcessedContent(string $type, array $variables = []): string;
    public function getAvailableTypes(): array;
}
