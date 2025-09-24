<?php

declare(strict_types=1);

namespace App\Repositories\MenuButton;

use App\Models\MenuButton;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface MenuButtonRepositoryInterface
{
    /**
     * Get paginated menu buttons with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Find a menu button by ID
     */
    public function findById(int $id): ?MenuButton;

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
    public function bulkUpdate(array $ids, array $data): int;

    /**
     * Bulk delete menu buttons
     */
    public function bulkDelete(array $ids): int;

    /**
     * Get menu buttons by IDs
     */
    public function getByIds(array $ids): Collection;

    /**
     * Get menu button hierarchy (tree structure)
     */
    public function getHierarchy(): Collection;

    /**
     * Check if menu button has children
     */
    public function hasChildren(MenuButton $menuButton): bool;

    /**
     * Check if any menu buttons have children
     */
    public function anyHaveChildren(array $ids): bool;

    /**
     * Get root menu buttons for bot
     */
    public function getRootMenuButtons(int $limit = 16): Collection;

    /**
     * Get all menu buttons
     */
    public function getAll(): Collection;
}
