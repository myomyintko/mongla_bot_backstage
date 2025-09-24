<?php

declare(strict_types=1);

namespace App\Services\MediaLibrary;

use App\Models\MediaLibrary;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

interface MediaLibraryServiceInterface
{
    /**
     * Get paginated media library items with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    /**
     * Get a media library item by ID
     */
    public function getById(int $id): ?MediaLibrary;

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
    public function bulkDelete(array $ids): array;

    /**
     * Upload and process files
     */
    public function uploadFiles(array $files, ?string $uploadPath = null): array;

    /**
     * Process a single uploaded file
     */
    public function processFile(UploadedFile $file, ?string $uploadPath = null): MediaLibrary;

    /**
     * Get file type based on MIME type
     */
    public function getFileType(string $mimeType): string;

    /**
     * Transform media library data for API response
     */
    public function transformMediaData(MediaLibrary $mediaLibrary): array;
}
