<?php

declare(strict_types=1);

namespace App\Repositories\Store;

use App\Models\Store;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface StoreRepositoryInterface
{
    /**
     * Get paginated stores with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Find a store by ID
     */
    public function findById(int $id): ?Store;

    /**
     * Create a new store
     */
    public function create(array $data): Store;

    /**
     * Update a store
     */
    public function update(Store $store, array $data): Store;

    /**
     * Delete a store
     */
    public function delete(Store $store): bool;

    /**
     * Bulk update stores
     */
    public function bulkUpdate(array $ids, array $data): int;

    /**
     * Bulk delete stores
     */
    public function bulkDelete(array $ids): int;

    /**
     * Get stores by IDs
     */
    public function getByIds(array $ids): Collection;

    /**
     * Get all stores for dropdown/select
     */
    public function getAllForSelect(): Collection;

    /**
     * Get trending/recommended stores
     */
    public function getTrendingStores(int $limit = 6): Collection;

    /**
     * Search stores by keyword
     */
    public function searchStores(string $keyword, int $limit = 10): Collection;

    /**
     * Get stores by menu button ID with pagination
     */
    public function getStoresByMenuButton(int $menuButtonId, int $page = 1, int $perPage = 10): Collection;

    /**
     * Get total count of stores by menu button ID
     */
    public function getStoresCountByMenuButton(int $menuButtonId): int;

    /**
     * Get stores by menu button ID including all sub-menu stores with pagination
     */
    public function getStoresByMenuButtonWithChildren(int $menuButtonId, int $page = 1, int $perPage = 10): Collection;

    /**
     * Get total count of stores by menu button ID including all sub-menu stores
     */
    public function getStoresCountByMenuButtonWithChildren(int $menuButtonId): int;
}
