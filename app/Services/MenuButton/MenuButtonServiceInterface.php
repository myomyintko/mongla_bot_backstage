<?php

declare(strict_types=1);

namespace App\Services\MenuButton;

use App\Models\MenuButton;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface MenuButtonServiceInterface
{
    /**
     * Get paginated menu buttons with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get a menu button by ID
     */
    public function getById(int $id): ?MenuButton;

    /**
     * Create a new menu button
     */
    public function create(array $data): MenuButton;

    /**
     * Update a menu button
     */
    public function update(MenuButton $menuButton, array $data): MenuButton;

    /**
     * Delete a menu button
     */
    public function delete(MenuButton $menuButton): bool;

    /**
     * Bulk update menu buttons
     */
    public function bulkUpdate(array $ids, array $data): array;

    /**
     * Bulk delete menu buttons
     */
    public function bulkDelete(array $ids): array;

    /**
     * Get menu button hierarchy (tree structure)
     */
    public function getHierarchy(): Collection;

    /**
     * Validate menu button deletion
     */
    public function validateDeletion(MenuButton $menuButton): array;

    /**
     * Validate bulk menu button deletion
     */
    public function validateBulkDeletion(array $ids): array;
}
