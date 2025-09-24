<?php

declare(strict_types=1);

namespace App\Repositories\MediaLibrary;

use App\Models\MediaLibrary;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class MediaLibraryRepository implements MediaLibraryRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = MediaLibrary::query();

        // Apply filters
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['file_type']) && $filters['file_type'] !== 'all') {
            $query->ofType($filters['file_type']);
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }

    public function findById(int $id): ?MediaLibrary
    {
        return MediaLibrary::find($id);
    }

    public function create(array $data): MediaLibrary
    {
        return MediaLibrary::create($data);
    }

    public function update(MediaLibrary $mediaLibrary, array $data): MediaLibrary
    {
        $mediaLibrary->update($data);
        return $mediaLibrary->fresh();
    }

    public function delete(MediaLibrary $mediaLibrary): bool
    {
        return $mediaLibrary->delete();
    }

    public function bulkDelete(array $ids): int
    {
        return MediaLibrary::whereIn('id', $ids)->delete();
    }

    public function getByIds(array $ids): Collection
    {
        return MediaLibrary::whereIn('id', $ids)->get();
    }

    public function search(string $query): Collection
    {
        return MediaLibrary::search($query)->get();
    }

    public function getByFileType(string $fileType): Collection
    {
        return MediaLibrary::ofType($fileType)->get();
    }
}
