<?php

declare(strict_types=1);

namespace App\Services\BotTemplate;

use App\Models\BotTemplate;
use App\Repositories\BotTemplate\BotTemplateRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class BotTemplateService implements BotTemplateServiceInterface
{
    public function __construct(
        private BotTemplateRepositoryInterface $botTemplateRepository
    ) {}

    public function getAllTemplates(): Collection
    {
        return $this->botTemplateRepository->getAll();
    }

    public function getActiveTemplates(): Collection
    {
        return $this->botTemplateRepository->getActiveTemplates();
    }

    public function getTemplateById(int $id): ?BotTemplate
    {
        return $this->botTemplateRepository->getById($id);
    }

    public function getTemplateByType(string $type): ?BotTemplate
    {
        return $this->botTemplateRepository->getByType($type);
    }

    public function createTemplate(array $data): BotTemplate
    {
        return $this->botTemplateRepository->create($data);
    }

    public function updateTemplate(int $id, array $data): bool
    {
        return $this->botTemplateRepository->update($id, $data);
    }

    public function deleteTemplate(int $id): bool
    {
        return $this->botTemplateRepository->delete($id);
    }

    public function activateTemplate(int $id): bool
    {
        return $this->botTemplateRepository->activate($id);
    }

    public function deactivateTemplate(int $id): bool
    {
        return $this->botTemplateRepository->deactivate($id);
    }

    public function getProcessedContent(string $type, array $variables = []): string
    {
        $template = $this->getTemplateByType($type);
        
        if (!$template) {
            Log::warning('No template found for type', ['type' => $type]);
            // Create a temporary template instance to process variables with default content
            $defaultContent = $this->getDefaultContent($type);
            $tempTemplate = new BotTemplate(['content' => $defaultContent]);
            return $tempTemplate->processContent($variables);
        }

        return $template->processContent($variables);
    }

    public function getAvailableTypes(): array
    {
        return BotTemplate::getAvailableTypes();
    }

    private function getDefaultContent(string $type): string
    {
        return BotTemplate::getDefaultContent($type);
    }
}
