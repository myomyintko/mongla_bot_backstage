<?php

declare(strict_types=1);

namespace App\Repositories\Advertisement;

use App\Models\Advertisement;
use App\Models\AdvertisementSend;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

class AdvertisementRepository implements AdvertisementRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Advertisement::with(['store']);

        // Filter by status if provided
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by store_id if provided
        if (isset($filters['store_id'])) {
            if ($filters['store_id'] === 'null' || $filters['store_id'] === 'none') {
                $query->whereNull('store_id');
            } elseif ($filters['store_id'] !== 'all') {
                $query->where('store_id', $filters['store_id']);
            }
            // If 'all', don't apply any filter (show all advertisements)
        }

        // Search by title or description
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Sort by created_at
        $query->orderBy('created_at', 'desc');

        return $query->paginate($perPage);
    }

    public function findById(int $id): ?Advertisement
    {
        return Advertisement::with(['store'])->find($id);
    }

    public function create(array $data): Advertisement
    {
        // Set default values
        $data['status'] = $data['status'] ?? 1;

        $advertisement = Advertisement::create($data);
        return $advertisement->load(['store']);
    }

    public function update(Advertisement $advertisement, array $data): Advertisement
    {
        $advertisement->update($data);
        return $advertisement->fresh(['store']);
    }

    public function delete(Advertisement $advertisement): bool
    {
        return $advertisement->delete();
    }

    public function bulkUpdate(array $ids, array $data): int
    {
        return Advertisement::whereIn('id', $ids)->update($data);
    }

    public function bulkDelete(array $ids): int
    {
        return Advertisement::whereIn('id', $ids)->delete();
    }

    public function getByIds(array $ids): Collection
    {
        return Advertisement::whereIn('id', $ids)->get();
    }

    public function getReadyToSend(): Collection
    {
        $now = Carbon::now();
        
        return Advertisement::active()
            ->where('start_date', '<=', $now)
            ->where('end_date', '>=', $now)
            ->with(['store'])
            ->get();
    }

    public function getSendHistory(int $advertisementId, int $userId, int $minutes): Collection
    {
        $since = Carbon::now()->subMinutes($minutes);
        
        return AdvertisementSend::where('advertisement_id', $advertisementId)
            ->where('user_id', $userId)
            ->where('sent_at', '>=', $since)
            ->get();
    }

    public function getLastSend(int $advertisementId, int $userId): ?AdvertisementSend
    {
        return AdvertisementSend::where('advertisement_id', $advertisementId)
            ->where('user_id', $userId)
            ->orderBy('sent_at', 'desc')
            ->first();
    }

    public function recordSend(int $advertisementId, int $userId): void
    {
        AdvertisementSend::create([
            'advertisement_id' => $advertisementId,
            'user_id' => $userId,
            'sent_at' => Carbon::now(),
        ]);
    }
}
