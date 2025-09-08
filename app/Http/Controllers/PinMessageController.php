<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\PinMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PinMessageController extends Controller
{
    /**
     * Display a listing of pin messages
     */
    public function index(Request $request): JsonResponse
    {
        $query = PinMessage::query();

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by content
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', '%' . $search . '%')
                  ->orWhere('btn_name', 'like', '%' . $search . '%')
                  ->orWhere('btn_link', 'like', '%' . $search . '%');
            });
        }

        $pinMessages = $query->paginate($request->get('per_page', 15));

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

        $validated['status'] = $validated['status'] ?? 1;

        $pinMessage = PinMessage::create($validated);

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

        $pinMessage->update($validated);

        return response()->json($pinMessage);
    }

    /**
     * Remove the specified pin message
     */
    public function destroy(PinMessage $pinMessage): JsonResponse
    {
        $pinMessage->delete();
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

        $updated = PinMessage::whereIn('id', $validated['ids'])
            ->update($validated['updates']);

        return response()->json([
            'message' => "Successfully updated {$updated} pin messages",
            'updated_count' => $updated
        ]);
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

        $deleted = PinMessage::whereIn('id', $validated['ids'])->delete();

        return response()->json([
            'message' => "Successfully deleted {$deleted} pin messages",
            'deleted_count' => $deleted
        ]);
    }
}
