<?php

declare(strict_types=1);

namespace App\Services\MenuButton;

use App\Models\MenuButton;
use App\Repositories\MenuButton\MenuButtonRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class MenuButtonService implements MenuButtonServiceInterface
{
    public function __construct(
        private MenuButtonRepositoryInterface $menuButtonRepository
    ) {}

    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->menuButtonRepository->getPaginated($filters, $perPage);
    }

    public function getById(int $id): ?MenuButton
    {
        return $this->menuButtonRepository->findById($id);
    }

    public function create(array $data): MenuButton
    {
        return $this->menuButtonRepository->create($data);
    }

    public function update(MenuButton $menuButton, array $data): MenuButton
    {
        return $this->menuButtonRepository->update($menuButton, $data);
    }

    public function delete(MenuButton $menuButton): bool
    {
        // Validate deletion
        $validation = $this->validateDeletion($menuButton);
        if (!$validation['valid']) {
            throw new \Exception($validation['message']);
        }

        return $this->menuButtonRepository->delete($menuButton);
    }

    public function bulkUpdate(array $ids, array $data): array
    {
        $updatedCount = $this->menuButtonRepository->bulkUpdate($ids, $data);

        return [
            'message' => "Updated {$updatedCount} menu buttons successfully"
        ];
    }

    public function bulkDelete(array $ids): array
    {
        // Validate bulk deletion
        $validation = $this->validateBulkDeletion($ids);
        if (!$validation['valid']) {
            throw new \Exception($validation['message']);
        }

        $deletedCount = $this->menuButtonRepository->bulkDelete($ids);

        return [
            'message' => "Deleted {$deletedCount} menu buttons successfully"
        ];
    }

    public function getHierarchy(): Collection
    {
        return $this->menuButtonRepository->getHierarchy();
    }

    public function validateDeletion(MenuButton $menuButton): array
    {
        if ($this->menuButtonRepository->hasChildren($menuButton)) {
            return [
                'valid' => false,
                'message' => 'Cannot delete menu button with children. Please delete children first.'
            ];
        }

        return [
            'valid' => true,
            'message' => 'Menu button can be deleted'
        ];
    }

    public function validateBulkDeletion(array $ids): array
    {
        if ($this->menuButtonRepository->anyHaveChildren($ids)) {
            return [
                'valid' => false,
                'message' => 'Cannot delete menu buttons that have children. Please delete children first.'
            ];
        }

        return [
            'valid' => true,
            'message' => 'Menu buttons can be deleted'
        ];
    }
}
