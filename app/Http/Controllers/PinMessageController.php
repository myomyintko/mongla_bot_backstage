<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\PinMessage;
use App\Services\PinMessage\PinMessageServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PinMessageController extends Controller
{
    public function __construct(
        private PinMessageServiceInterface $pinMessageService
    ) {}
    /**
     * Display a listing of pin messages
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'status' => $request->get('status'),
            'search' => $request->get('search'),
        ];

        $perPage = (int) $request->get('per_page', 15);
        $pinMessages = $this->pinMessageService->getPaginated($filters, $perPage);

        return response()->json($pinMessages);
    }

    /**
     * Store a newly created pin message
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'media_url' => 'nullable|string|max:500',
            'status' => 'nullable|integer|in:0,1',
            'sort' => 'nullable|integer|min:0',
            'content' => 'nullable|string',
            'btn_name' => 'nullable|string|max:255',
            'btn_link' => 'nullable|string|max:500',
        ]);

        $pinMessage = $this->pinMessageService->create($validated);

        return response()->json($pinMessage, 201);
    }

    /**
     * Display the specified pin message
     */
    public function show(PinMessage $pinMessage): JsonResponse
    {
        return response()->json($pinMessage);
    }

    /**
     * Update the specified pin message
     */
    public function update(Request $request, PinMessage $pinMessage): JsonResponse
    {
        $validated = $request->validate([
            'media_url' => 'nullable|string|max:500',
            'status' => 'nullable|integer|in:0,1',
            'sort' => 'nullable|integer|min:0',
            'content' => 'nullable|string',
            'btn_name' => 'nullable|string|max:255',
            'btn_link' => 'nullable|string|max:500',
        ]);

        $pinMessage = $this->pinMessageService->update($pinMessage, $validated);

        return response()->json($pinMessage);
    }

    /**
     * Remove the specified pin message
     */
    public function destroy(PinMessage $pinMessage): JsonResponse
    {
        $this->pinMessageService->delete($pinMessage);
        return response()->json(['message' => 'Pin message deleted successfully']);
    }

    /**
     * Bulk update pin messages
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:pin_messages,id',
            'updates' => 'required|array',
            'updates.status' => 'nullable|integer|in:0,1',
            'updates.sort' => 'nullable|integer|min:0',
            'updates.btn_name' => 'nullable|string|max:255',
            'updates.btn_link' => 'nullable|string|max:500',
        ]);

        $result = $this->pinMessageService->bulkUpdate($validated['ids'], $validated['updates']);

        return response()->json($result);
    }

    /**
     * Bulk delete pin messages
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:pin_messages,id',
        ]);

        $result = $this->pinMessageService->bulkDelete($validated['ids']);

        return response()->json($result);
    }
}
