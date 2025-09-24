<?php

declare(strict_types=1);

namespace App\Services\Store;

use App\Models\Store;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface StoreServiceInterface
{
    /**
     * Get paginated stores with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get a store by ID
     */
    public function getById(int $id): ?Store;

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
    public function bulkUpdate(array $ids, array $data): array;

    /**
     * Bulk delete stores
     */
    public function bulkDelete(array $ids): array;

    /**
     * Get all stores for dropdown/select
     */
    public function getAllForSelect(): Collection;

    /**
     * Import stores from Excel
     */
    public function importFromExcel(string $filePath): array;
}
