<?php

declare(strict_types=1);

namespace App\Services\MediaLibrary;

use App\Models\MediaLibrary;
use App\Repositories\MediaLibrary\MediaLibraryRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Owenoj\LaravelGetId3\GetId3;

class MediaLibraryService implements MediaLibraryServiceInterface
{
    public function __construct(
        private MediaLibraryRepositoryInterface $mediaLibraryRepository
    ) {}

    public function getPaginated(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->mediaLibraryRepository->getPaginated($filters, $perPage);
    }

    public function getById(int $id): ?MediaLibrary
    {
        return $this->mediaLibraryRepository->findById($id);
    }

    public function create(array $data): MediaLibrary
    {
        return $this->mediaLibraryRepository->create($data);
    }

    public function update(MediaLibrary $mediaLibrary, array $data): MediaLibrary
    {
        return $this->mediaLibraryRepository->update($mediaLibrary, $data);
    }

    public function delete(MediaLibrary $mediaLibrary): bool
    {
        // Delete the physical file
        if (Storage::exists($mediaLibrary->file_path)) {
            Storage::delete($mediaLibrary->file_path);
        }

        return $this->mediaLibraryRepository->delete($mediaLibrary);
    }

    public function bulkDelete(array $ids): array
    {
        $mediaItems = $this->mediaLibraryRepository->getByIds($ids);

        foreach ($mediaItems as $media) {
            // Delete the physical file
            if (Storage::exists($media->file_path)) {
                Storage::delete($media->file_path);
            }
        }

        $deletedCount = $this->mediaLibraryRepository->bulkDelete($ids);

        return [
            'success' => true,
            'message' => "{$deletedCount} media item(s) deleted successfully",
        ];
    }

    public function uploadFiles(array $files, ?string $uploadPath = null): array
    {
        $uploadedFiles = [];
        $errors = [];

        foreach ($files as $file) {
            try {
                $mediaItem = $this->processFile($file, $uploadPath);
                $uploadedFiles[] = $mediaItem;
            } catch (\Exception $e) {
                $errors[] = [
                    'file' => $file->getClientOriginalName(),
                    'error' => $e->getMessage(),
                ];
            }
        }

        if (empty($uploadedFiles)) {
            return [
                'success' => false,
                'message' => 'No files were uploaded successfully',
                'errors' => $errors,
            ];
        }

        return [
            'success' => true,
            'message' => count($uploadedFiles) . ' file(s) uploaded successfully',
            'data' => collect($uploadedFiles)->map(function ($item) {
                return $this->transformMediaData($item);
            }),
            'errors' => $errors,
        ];
    }

    public function processFile(UploadedFile $file, ?string $uploadPath = null): MediaLibrary
    {
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();

        // Generate unique filename
        $filename = Str::uuid() . '.' . $extension;
        
        // Use upload_path if provided, otherwise use default structure
        if ($uploadPath) {
            $filePath = $uploadPath . '/' . $filename;
            $storedPath = $file->storeAs($uploadPath, $filename, 'public');
        } else {
            $filePath = date('Y/m') . '/' . $filename;
            $storedPath = $file->storeAs(date('Y/m'), $filename, 'public');
        }

        // Determine file type
        $fileType = $this->getFileType($mimeType);

        // Get file dimensions and duration for images/videos
        $width = null;
        $height = null;
        $duration = null;

        if ($fileType === 'image') {
            try {
                $manager = new ImageManager(new Driver());
                $image = $manager->read($file);
                $width = $image->width();
                $height = $image->height();
            } catch (\Exception $e) {
                // Ignore image processing errors
            }
        } elseif ($fileType === 'video') {
            try {
                $getId3 = GetId3::fromUploadedFile($file);
                $fileInfo = $getId3->extractInfo();
                
                // Get duration in seconds
                $duration = (int) $getId3->getPlaytimeSeconds();
                
                // Also try to get dimensions if available
                if (isset($fileInfo['video']['resolution_x']) && isset($fileInfo['video']['resolution_y'])) {
                    $width = (int) $fileInfo['video']['resolution_x'];
                    $height = (int) $fileInfo['video']['resolution_y'];
                }
            } catch (\Exception $e) {
                // Ignore video processing errors, but log them for debugging
                \Log::warning('Failed to extract video metadata: ' . $e->getMessage());
            }
        }

        // Create media library entry
        $media = $this->mediaLibraryRepository->create([
            'original_name' => $originalName,
            'file_path' => $storedPath,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'file_type' => $fileType,
            'width' => $width,
            'height' => $height,
            'duration' => $duration,
        ]);

        return $media;
    }

    public function getFileType(string $mimeType): string
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        }

        if (str_starts_with($mimeType, 'video/')) {
            return 'video';
        }

        if (in_array($mimeType, [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ])) {
            return 'document';
        }

        return 'other';
    }

    public function transformMediaData(MediaLibrary $mediaLibrary): array
    {
        return $mediaLibrary->append(['url', 'extension', 'formatted_size', 'formatted_duration'])->toArray();
    }
}
