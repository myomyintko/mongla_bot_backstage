<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MediaController extends Controller
{
    /**
     * Upload media files (images and videos)
     */
    public function upload(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'files' => 'required|array|max:10',
                'files.*' => 'required|file|mimes:jpeg,jpg,png,gif,webp,avif,mp4,mov,avi,mkv,webm|max:102400', // 100MB max
                'path' => 'nullable|string|max:255|regex:/^[a-zA-Z0-9\/\-_]+$/', // Allow alphanumeric, forward slash, dash, underscore
            ]);

            $uploadedFiles = [];
            $basePath = $request->input('path', 'media'); // Default to 'media' if no path provided
            
            // Sanitize path - remove leading/trailing slashes
            $basePath = trim($basePath, '/');
            
            // If no path provided or path is just 'media', use 'media' as base
            // Otherwise, use the provided path as-is (allowing custom folder structures)
            if (empty($basePath) || $basePath === 'media') {
                $basePath = 'media';
            }
            
            // Debug: Log the path being used
            \Log::info('Media upload path:', ['requested_path' => $request->input('path'), 'final_path' => $basePath]);

            foreach ($request->file('files') as $file) {
                // Generate unique filename
                $extension = $file->getClientOriginalExtension();
                $filename = Str::uuid() . '.' . $extension;
                
                // Store file in the specified path
                $path = $file->storeAs($basePath, $filename, 'public');
                
                // Get file info
                $fileInfo = [
                    'original_name' => $file->getClientOriginalName(),
                    'filename' => $filename,
                    'path' => $path,
                    'url' => Storage::url($path),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'type' => str_starts_with($file->getMimeType(), 'video/') ? 'video' : 'image',
                ];

                $uploadedFiles[] = $fileInfo;
            }

            return response()->json([
                'success' => true,
                'message' => 'Files uploaded successfully',
                'data' => $uploadedFiles,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete media file
     */
    public function delete(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'path' => 'required|string',
            ]);

            $path = $request->input('path');
            
            // Check if file exists
            if (!Storage::disk('public')->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found',
                ], 404);
            }

            // Delete file
            Storage::disk('public')->delete($path);

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delete failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get media file info
     */
    public function info(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'path' => 'required|string',
            ]);

            $path = $request->input('path');
            
            // Check if file exists
            if (!Storage::disk('public')->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found',
                ], 404);
            }

            $fullPath = Storage::disk('public')->path($path);
            $mimeType = file_exists($fullPath) ? mime_content_type($fullPath) : null;
            
            $fileInfo = [
                'path' => $path,
                'url' => Storage::url($path),
                'size' => Storage::disk('public')->size($path),
                'mime_type' => $mimeType,
                'last_modified' => Storage::disk('public')->lastModified($path),
            ];

            return response()->json([
                'success' => true,
                'data' => $fileInfo,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get file info: ' . $e->getMessage(),
            ], 500);
        }
    }
}
