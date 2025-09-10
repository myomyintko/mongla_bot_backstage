<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\MediaLibrary;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Owenoj\LaravelGetId3\GetId3;

class MediaLibraryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MediaLibrary::query();

        // Apply filters
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('file_type') && $request->file_type !== 'all') {
            $query->ofType($request->file_type);
        }


        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 20);
        $media = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => collect($media->items())->map(function ($item) {
                return $item->append(['url', 'extension', 'formatted_size', 'formatted_duration']);
            }),
            'meta' => [
                'current_page' => $media->currentPage(),
                'last_page' => $media->lastPage(),
                'per_page' => $media->perPage(),
                'total' => $media->total(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'files' => 'required|array|max:50', // Increased from 10 to 50
            'files.*' => 'required|file|max:10240', // 10MB max per file
            'upload_path' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $uploadedFiles = [];
        $errors = [];

        foreach ($request->file('files') as $file) {
            try {
                $mediaItem = $this->processFile($file, $request);
                $uploadedFiles[] = $mediaItem;
            } catch (\Exception $e) {
                $errors[] = [
                    'file' => $file->getClientOriginalName(),
                    'error' => $e->getMessage(),
                ];
            }
        }

        if (empty($uploadedFiles)) {
            return response()->json([
                'success' => false,
                'message' => 'No files were uploaded successfully',
                'errors' => $errors,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => count($uploadedFiles) . ' file(s) uploaded successfully',
            'data' => collect($uploadedFiles)->map(function ($item) {
                return $item->append(['url', 'extension', 'formatted_size', 'formatted_duration']);
            }),
            'errors' => $errors,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $media = MediaLibrary::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $media->append(['url', 'extension', 'formatted_size', 'formatted_duration']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $media = MediaLibrary::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'original_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $media->update($request->only([
            'original_name',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Media updated successfully',
            'data' => $media->append(['url', 'extension', 'formatted_size', 'formatted_duration']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $media = MediaLibrary::findOrFail($id);

        // Delete the physical file
        if (Storage::exists($media->file_path)) {
            Storage::delete($media->file_path);
        }

        // Delete the database record
        $media->delete();

        return response()->json([
            'success' => true,
            'message' => 'Media deleted successfully',
        ]);
    }

    /**
     * Bulk delete multiple media items
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:media_library,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $mediaItems = MediaLibrary::whereIn('id', $request->ids)->get();

        foreach ($mediaItems as $media) {
            // Delete the physical file
            if (Storage::exists($media->file_path)) {
                Storage::delete($media->file_path);
            }
        }

        // Delete the database records
        $deletedCount = MediaLibrary::whereIn('id', $request->ids)->delete();

        return response()->json([
            'success' => true,
            'message' => "{$deletedCount} media item(s) deleted successfully",
        ]);
    }

    /**
     * Process uploaded file and create media library entry
     */
    private function processFile($file, Request $request): MediaLibrary
    {
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();

        // Generate unique filename
        $filename = Str::uuid() . '.' . $extension;
        
        // Use upload_path if provided, otherwise use default structure
        $uploadPath = $request->input('upload_path');
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
        $media = MediaLibrary::create([
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

    /**
     * Determine file type based on MIME type
     */
    private function getFileType(string $mimeType): string
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
}
