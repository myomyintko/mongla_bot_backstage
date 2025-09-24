<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Advertisement;
use App\Services\Advertisement\AdvertisementServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

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
        if ($advertisement->end_date && Carbon::now()->gt($advertisement->end_date)) {
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
     * Get advertisement statistics for dashboard
     */
    public function stats(): JsonResponse
    {
        $totalAds = Advertisement::count();
        $activeAds = Advertisement::where('status', 1)->count();
        // Mock budget data since we don't have budget field
        $totalSpend = $activeAds * rand(500, 2000);
        $clickRate = 3.2; // Mock data - could be calculated from actual click tracking

        return response()->json([
            'total_ads' => $totalAds,
            'active_ads' => $activeAds,
            'total_spend' => $totalSpend,
            'click_rate' => $clickRate,
        ]);
    }

    /**
     * Get top performing advertisements
     */
    public function topPerforming(): JsonResponse
    {
        $ads = Advertisement::select(['id', 'title'])
            ->where('status', 1)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($ad) {
                // Mock performance data
                $views = rand(50000, 200000);
                $clicks = rand(1000, 8000);
                $ctr = round(($clicks / $views) * 100, 1);
                return [
                    'name' => $ad->title,
                    'views' => number_format($views),
                    'clicks' => number_format($clicks),
                    'ctr' => $ctr . '%',
                ];
            });

        return response()->json([
            'data' => $ads
        ]);
    }

    /**
     * Get campaign status breakdown
     */
    public function statusBreakdown(): JsonResponse
    {
        $active = Advertisement::where('status', 1)->count();
        $paused = Advertisement::where('status', 0)->count();
        $completed = Advertisement::where('end_date', '<', Carbon::now())->count();
        $draft = Advertisement::whereNull('start_date')->count();

        return response()->json([
            'active' => $active,
            'paused' => $paused,
            'completed' => $completed,
            'draft' => $draft,
        ]);
    }

    /**
     * Get recent advertisement activity
     */
    public function recentActivity(): JsonResponse
    {
        $activities = Advertisement::select(['id', 'title', 'status', 'updated_at'])
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($ad) {
                $action = match($ad->status) {
                    1 => 'Campaign activated',
                    0 => 'Campaign paused',
                    default => 'Campaign updated'
                };

                return [
                    'name' => $ad->title,
                    'action' => $action,
                    'time' => $ad->updated_at->diffForHumans(),
                ];
            });

        return response()->json([
            'data' => $activities
        ]);
    }

    /**
     * Get performance metrics
     */
    public function metrics(): JsonResponse
    {
        $activeAds = Advertisement::where('status', 1)->count();
        // Mock metrics data
        $impressions = $activeAds * rand(10000, 50000);
        $clicks = $activeAds * rand(500, 2000);
        $avgCpc = $clicks > 0 ? rand(50, 150) / 100 : 0;

        return response()->json([
            'impressions' => $impressions,
            'clicks' => $clicks,
            'cpc' => round($avgCpc, 2),
        ]);
    }

    /**
     * Get upcoming campaigns
     */
    public function upcoming(): JsonResponse
    {
        $campaigns = Advertisement::select(['id', 'title', 'start_date', 'status'])
            ->where('start_date', '>', Carbon::now())
            ->orderBy('start_date', 'asc')
            ->limit(4)
            ->get()
            ->map(function ($ad) {
                return [
                    'name' => $ad->title,
                    'date' => $ad->start_date->format('M j, Y'),
                    'budget' => '$' . number_format(rand(5000, 20000)),
                    'status' => $ad->status ? 'Scheduled' : 'Draft',
                ];
            });

        return response()->json([
            'data' => $campaigns
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
                // Clear existing jobs for this advertisement before pausing
                $this->clearAdvertisementJobs($advertisement->id);

                $this->advertisementService->update($advertisement, ['status' => 0]);
                $pausedCount++;
            }

            return response()->json([
                'message' => "Successfully paused {$pausedCount} advertisements and cleared their jobs",
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
                          ->orWhere('end_date', '>', Carbon::now());
                })
                ->get();

            $resumedCount = 0;

            foreach ($inactiveAds as $advertisement) {
                // Clear any existing jobs before resuming
                $this->clearAdvertisementJobs($advertisement->id);

                $this->advertisementService->update($advertisement, ['status' => 1]);
                $resumedCount++;
            }

            return response()->json([
                'message' => "Successfully resumed {$resumedCount} advertisements and cleared their old jobs",
                'resumed_count' => $resumedCount
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to resume advertisements: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear existing jobs for a specific advertisement
     */
    private function clearAdvertisementJobs(int $advertisementId): void
    {
        try {
            // Get all advertisement delivery jobs and check each one manually
            $jobs = \Illuminate\Support\Facades\DB::table('jobs')
                ->where('queue', 'advertisements')
                ->where('payload', 'like', '%ProcessAdvertisementDelivery%')
                ->get();

            $deletedCount = 0;
            foreach ($jobs as $job) {
                $data = json_decode($job->payload, true);
                if (isset($data['data']['command'])) {
                    $command = $data['data']['command'];

                    // Check if this job contains the specific advertisement ID
                    if (preg_match('/"id";i:' . $advertisementId . ';/', $command)) {
                        \Illuminate\Support\Facades\DB::table('jobs')
                            ->where('id', $job->id)
                            ->delete();
                        $deletedCount++;
                    }
                }
            }

            \Illuminate\Support\Facades\Log::info('Cleared existing jobs for advertisement', [
                'ad_id' => $advertisementId,
                'deleted_jobs_count' => $deletedCount,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to clear existing jobs for advertisement', [
                'ad_id' => $advertisementId,
                'error' => $e->getMessage(),
            ]);
        }
    }

}
