<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StoreController extends Controller
{
    /**
     * Display a listing of stores
     */
    public function index(Request $request): JsonResponse
    {
        $query = Store::with(['menuButton']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by recommendation if provided
        if ($request->has('recommand')) {
            $query->where('recommand', $request->boolean('recommand'));
        }

        // Filter by menu_button_id if provided
        if ($request->has('menu_button_id')) {
            if ($request->menu_button_id === 'null') {
                $query->whereNull('menu_button_id');
            } else {
                $query->where('menu_button_id', $request->menu_button_id);
            }
        }

        // Search by name or address
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('address', 'like', '%' . $search . '%');
            });
        }

        // Sort by recommendation first, then by created_at
        $query->orderBy('recommand', 'desc')->orderBy('created_at', 'desc');

        $stores = $query->paginate($request->get('per_page', 15));

        return response()->json($stores);
    }

    /**
     * Store a newly created store
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'media_url' => 'nullable|string|max:500',
            'open_hour' => 'nullable|string|max:10',
            'close_hour' => 'nullable|string|max:10',
            'status' => 'nullable|integer|in:0,1',
            'address' => 'nullable|string|max:500',
            'recommand' => 'nullable|boolean',
            'sub_btns' => 'nullable|array',
            'menu_button_id' => 'nullable|exists:menu_buttons,id',
        ]);

        // Set default values
        $validated['status'] = $validated['status'] ?? 1;
        $validated['recommand'] = $validated['recommand'] ?? false;

        $store = Store::create($validated);
        $store->load(['menuButton']);

        return response()->json($store, 201);
    }

    /**
     * Display the specified store
     */
    public function show(Store $store): JsonResponse
    {
        $store->load(['menuButton']);
        return response()->json($store);
    }

    /**
     * Update the specified store
     */
    public function update(Request $request, Store $store): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'media_url' => 'nullable|string|max:500',
            'open_hour' => 'nullable|string|max:10',
            'close_hour' => 'nullable|string|max:10',
            'status' => 'nullable|integer|in:0,1',
            'address' => 'nullable|string|max:500',
            'recommand' => 'nullable|boolean',
            'sub_btns' => 'nullable|array',
            'menu_button_id' => 'nullable|exists:menu_buttons,id',
        ]);

        $store->update($validated);
        $store->load(['menuButton']);

        return response()->json($store);
    }

    /**
     * Remove the specified store
     */
    public function destroy(Store $store): JsonResponse
    {
        $store->delete();
        return response()->json(['message' => 'Store deleted successfully']);
    }

    /**
     * Bulk update stores
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:stores,id',
            'updates' => 'required|array',
            'updates.status' => 'nullable|integer|in:0,1',
            'updates.recommand' => 'nullable|boolean',
        ]);

        $updated = Store::whereIn('id', $validated['ids'])
            ->update($validated['updates']);

        return response()->json([
            'message' => "Successfully updated {$updated} stores",
            'updated_count' => $updated
        ]);
    }

    /**
     * Bulk delete stores
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:stores,id',
        ]);

        $deleted = Store::whereIn('id', $validated['ids'])->delete();

        return response()->json([
            'message' => "Successfully deleted {$deleted} stores",
            'deleted_count' => $deleted
        ]);
    }
}
