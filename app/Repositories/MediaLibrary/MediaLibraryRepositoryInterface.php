<?php

declare(strict_types=1);

namespace App\Repositories\MediaLibrary;

use App\Models\MediaLibrary;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface MediaLibraryRepositoryInterface
{
    /**
     * Get paginated media library items with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    /**
     * Find a media library item by ID
     */
    public function findById(int $id): ?MediaLibrary;

    /**
     * Create a new media library item
     */
    public function create(array $data): MediaLibrary;

    /**
     * Update a media library item
     */
    public function update(MediaLibrary $mediaLibrary, array $data): MediaLibrary;

    /**
     * Delete a media library item
     */
    public function delete(MediaLibrary $mediaLibrary): bool;

    /**
     * Bulk delete media library items
     */
    public function bulkDelete(array $ids): int;

    /**
     * Get media library items by IDs
     */
    public function getByIds(array $ids): Collection;

    /**
     * Search media library items
     */
    public function search(string $query): Collection;

    /**
     * Get media library items by file type
     */
    public function getByFileType(string $fileType): Collection;
}
