<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Advertisement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdvertisementController extends Controller
{
    /**
     * Display a listing of advertisements
     */
    public function index(Request $request): JsonResponse
    {
        $query = Advertisement::with(['store']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by store_id if provided
        if ($request->has('store_id')) {
            if ($request->store_id === 'null' || $request->store_id === 'none') {
                $query->whereNull('store_id');
            } elseif ($request->store_id !== 'all') {
                $query->where('store_id', $request->store_id);
            }
            // If 'all', don't apply any filter (show all advertisements)
        }

        // Search by title or description
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Sort by created_at
        $query->orderBy('created_at', 'desc');

        $advertisements = $query->paginate($request->get('per_page', 15));

        return response()->json($advertisements);
    }

    /**
     * Store a newly created advertisement
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'store_id' => 'nullable|exists:stores,id',
            'title' => 'required|string|max:255',
            'status' => 'nullable|integer|in:0,1',
            'description' => 'nullable|string',
            'media_url' => 'nullable|string|max:500',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'frequency_cap_minutes' => 'nullable|integer|min:1',
        ]);

        // Set default values
        $validated['status'] = $validated['status'] ?? 1;

        $advertisement = Advertisement::create($validated);
        $advertisement->load(['store']);

        return response()->json($advertisement, 201);
    }

    /**
     * Display the specified advertisement
     */
    public function show(Advertisement $advertisement): JsonResponse
    {
        $advertisement->load(['store']);
        return response()->json($advertisement);
    }

    /**
     * Update the specified advertisement
     */
    public function update(Request $request, Advertisement $advertisement): JsonResponse
    {
        $validated = $request->validate([
            'store_id' => 'nullable|exists:stores,id',
            'title' => 'required|string|max:255',
            'status' => 'nullable|integer|in:0,1',
            'description' => 'nullable|string',
            'media_url' => 'nullable|string|max:500',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'frequency_cap_minutes' => 'nullable|integer|min:1',
        ]);

        $advertisement->update($validated);
        $advertisement->load(['store']);

        return response()->json($advertisement);
    }

    /**
     * Remove the specified advertisement
     */
    public function destroy(Advertisement $advertisement): JsonResponse
    {
        $advertisement->delete();
        return response()->json(['message' => 'Advertisement deleted successfully']);
    }

    /**
     * Bulk update advertisements
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:advertisements,id',
            'updates' => 'required|array',
            'updates.status' => 'nullable|integer|in:0,1',
        ]);

        $updated = Advertisement::whereIn('id', $validated['ids'])
            ->update($validated['updates']);

        return response()->json([
            'message' => "Successfully updated {$updated} advertisements",
            'updated_count' => $updated
        ]);
    }

    /**
     * Bulk delete advertisements
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:advertisements,id',
        ]);

        $deleted = Advertisement::whereIn('id', $validated['ids'])->delete();

        return response()->json([
            'message' => "Successfully deleted {$deleted} advertisements",
            'updated_count' => $deleted
        ]);
    }
}
