<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Advertisement;
use App\Services\Advertisement\AdvertisementServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdvertisementController extends Controller
{
    public function __construct(
        private AdvertisementServiceInterface $advertisementService
    ) {}
    /**
     * Display a listing of advertisements
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'status' => $request->get('status'),
            'store_id' => $request->get('store_id'),
            'search' => $request->get('search'),
        ];

        $perPage = (int) $request->get('per_page', 15);
        $advertisements = $this->advertisementService->getPaginated($filters, $perPage);

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
            'sub_btns' => 'nullable|array',
        ]);

        $advertisement = $this->advertisementService->create($validated);

        return response()->json($advertisement, 201);
    }

    /**
     * Display the specified advertisement
     */
    public function show(Advertisement $advertisement): JsonResponse
    {
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
            'sub_btns' => 'nullable|array',
        ]);

        $advertisement = $this->advertisementService->update($advertisement, $validated);

        return response()->json($advertisement);
    }

    /**
     * Remove the specified advertisement
     */
    public function destroy(Advertisement $advertisement): JsonResponse
    {
        $this->advertisementService->delete($advertisement);
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

        $result = $this->advertisementService->bulkUpdate($validated['ids'], $validated['updates']);

        return response()->json($result);
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

        $result = $this->advertisementService->bulkDelete($validated['ids']);

        return response()->json($result);
    }

    /**
     * Pause a specific advertisement
     */
    public function pause(Advertisement $advertisement): JsonResponse
    {
        if ($advertisement->status !== 1) {
            return response()->json([
                'message' => 'Advertisement is not currently active'
            ], 400);
        }

        $updatedAdvertisement = $this->advertisementService->update($advertisement, [
            'status' => 0
        ]);

        return response()->json([
            'message' => 'Advertisement paused successfully',
            'advertisement' => $updatedAdvertisement
        ]);
    }

    /**
     * Resume a specific advertisement
     */
    public function resume(Advertisement $advertisement): JsonResponse
    {
        if ($advertisement->status !== 0) {
            return response()->json([
                'message' => 'Advertisement is not currently paused'
            ], 400);
        }

        // Check if advertisement has expired
        if ($advertisement->end_date && now()->gt($advertisement->end_date)) {
            return response()->json([
                'message' => 'Cannot resume expired advertisement'
            ], 400);
        }

        $updatedAdvertisement = $this->advertisementService->update($advertisement, [
            'status' => 1
        ]);

        return response()->json([
            'message' => 'Advertisement resumed successfully',
            'advertisement' => $updatedAdvertisement
        ]);
    }

    /**
     * Bulk pause all active advertisements
     */
    public function bulkPauseAll(): JsonResponse
    {
        try {
            $activeAds = Advertisement::where('status', 1)->get();
            $pausedCount = 0;

            foreach ($activeAds as $advertisement) {
                $this->advertisementService->update($advertisement, ['status' => 0]);
                $pausedCount++;
            }

            return response()->json([
                'message' => "Successfully paused {$pausedCount} advertisements",
                'paused_count' => $pausedCount
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to pause advertisements: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk resume all inactive advertisements (excluding expired ones)
     */
    public function bulkResumeAll(): JsonResponse
    {
        try {
            $inactiveAds = Advertisement::where('status', 0)
                ->where(function($query) {
                    $query->whereNull('end_date')
                          ->orWhere('end_date', '>', now());
                })
                ->get();

            $resumedCount = 0;

            foreach ($inactiveAds as $advertisement) {
                $this->advertisementService->update($advertisement, ['status' => 1]);
                $resumedCount++;
            }

            return response()->json([
                'message' => "Successfully resumed {$resumedCount} advertisements",
                'resumed_count' => $resumedCount
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to resume advertisements: ' . $e->getMessage()
            ], 500);
        }
    }
}
