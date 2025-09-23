<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\MediaLibrary;
use App\Services\MediaLibrary\MediaLibraryServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class MediaLibraryController extends Controller
{
    public function __construct(
        private MediaLibraryServiceInterface $mediaLibraryService
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->get('search'),
            'file_type' => $request->get('file_type'),
            'sort_by' => $request->get('sort_by', 'created_at'),
            'sort_order' => $request->get('sort_order', 'desc'),
        ];

        $perPage = (int) $request->get('per_page', 20);
        $media = $this->mediaLibraryService->getPaginated($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => collect($media->items())->map(function ($item) {
                return $this->mediaLibraryService->transformMediaData($item);
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

        $result = $this->mediaLibraryService->uploadFiles(
            $request->file('files'),
            $request->input('upload_path')
        );

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $media = $this->mediaLibraryService->getById((int) $id);

        if (!$media) {
            return response()->json([
                'success' => false,
                'message' => 'Media not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->mediaLibraryService->transformMediaData($media),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $media = $this->mediaLibraryService->getById((int) $id);

        if (!$media) {
            return response()->json([
                'success' => false,
                'message' => 'Media not found',
            ], 404);
        }

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

        $media = $this->mediaLibraryService->update($media, $request->only([
            'original_name',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Media updated successfully',
            'data' => $this->mediaLibraryService->transformMediaData($media),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $media = $this->mediaLibraryService->getById((int) $id);

        if (!$media) {
            return response()->json([
                'success' => false,
                'message' => 'Media not found',
            ], 404);
        }

        $this->mediaLibraryService->delete($media);

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

        $result = $this->mediaLibraryService->bulkDelete($request->ids);

        return response()->json($result);
    }

}
