<?php

declare(strict_types=1);

namespace App\Repositories\Store;

use App\Models\Store;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class StoreRepository implements StoreRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Store::with(['menuButton']);

        // Filter by status if provided
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by recommendation if provided
        if (isset($filters['recommand'])) {
            $query->where('recommand', $filters['recommand']);
        }

        // Filter by menu_button_id if provided
        if (isset($filters['menu_button_id'])) {
            if ($filters['menu_button_id'] === 'null' || $filters['menu_button_id'] === 'none') {
                $query->whereNull('menu_button_id');
            } elseif ($filters['menu_button_id'] !== 'all') {
                $query->where('menu_button_id', $filters['menu_button_id']);
            }
            // If 'all', don't apply any filter (show all stores)
        }

        // Search by name or address
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('address', 'like', '%' . $search . '%');
            });
        }

        // Sort by recommendation first, then by created_at
        $query->orderBy('recommand', 'desc')
              ->orderBy('created_at', 'desc');

        return $query->paginate($perPage);
    }

    public function findById(int $id): ?Store
    {
        return Store::with(['menuButton'])->find($id);
    }

    public function create(array $data): Store
    {
        $store = Store::create($data);
        return $store->load(['menuButton']);
    }

    public function update(Store $store, array $data): Store
    {
        $store->update($data);
        return $store->fresh(['menuButton']);
    }

    public function delete(Store $store): bool
    {
        return $store->delete();
    }

    public function bulkUpdate(array $ids, array $data): int
    {
        return Store::whereIn('id', $ids)->update($data);
    }

    public function bulkDelete(array $ids): int
    {
        return Store::whereIn('id', $ids)->delete();
    }

    public function getByIds(array $ids): Collection
    {
        return Store::whereIn('id', $ids)->get();
    }

    public function getAllForSelect(): Collection
    {
        return Store::select('id', 'name')->orderBy('name')->get();
    }

    public function getTrendingStores(int $limit = 6): Collection
    {
        // Get trending/recommended stores with some randomization for refresh
        $trendingStores = Store::active()
            ->recommended()
            ->with('menuButton')
            ->orderByRaw('RAND()') // Add randomization for refresh
            ->limit($limit)
            ->get();

        return $trendingStores;
    }

    public function searchStores(string $keyword, int $limit = 10): Collection
    {
        return Store::active()
            ->where(function ($query) use ($keyword) {
                $query->where('name', 'like', "%{$keyword}%")
                      ->orWhere('description', 'like', "%{$keyword}%")
                      ->orWhere('address', 'like', "%{$keyword}%");
            })
            ->with('menuButton')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getStoresByMenuButton(int $menuButtonId, int $page = 1, int $perPage = 10): Collection
    {
        $offset = ($page - 1) * $perPage;

        return Store::active()
            ->where('menu_button_id', $menuButtonId)
            ->with('menuButton')
            ->orderBy('created_at', 'desc')
            ->offset($offset)
            ->limit($perPage)
            ->get();
    }

    public function getStoresCountByMenuButton(int $menuButtonId): int
    {
        return Store::active()
            ->where('menu_button_id', $menuButtonId)
            ->count();
    }

    public function getStoresByMenuButtonWithChildren(int $menuButtonId, int $page = 1, int $perPage = 10): Collection
    {
        $offset = ($page - 1) * $perPage;
        
        // Get all menu button IDs (parent + children)
        $menuButtonIds = $this->getMenuButtonIdsWithChildren($menuButtonId);

        return Store::active()
            ->whereIn('menu_button_id', $menuButtonIds)
            ->with('menuButton')
            ->orderBy('created_at', 'desc')
            ->offset($offset)
            ->limit($perPage)
            ->get();
    }

    public function getStoresCountByMenuButtonWithChildren(int $menuButtonId): int
    {
        // Get all menu button IDs (parent + children)
        $menuButtonIds = $this->getMenuButtonIdsWithChildren($menuButtonId);

        return Store::active()
            ->whereIn('menu_button_id', $menuButtonIds)
            ->count();
    }

    /**
     * Get all menu button IDs including the parent and all its children
     */
    private function getMenuButtonIdsWithChildren(int $menuButtonId): array
    {
        // Start with the parent menu button ID
        $menuButtonIds = [$menuButtonId];
        
        // Get all child menu button IDs
        $childIds = \App\Models\MenuButton::where('parent_id', $menuButtonId)
            ->pluck('id')
            ->toArray();
        
        // Add child IDs to the array
        $menuButtonIds = array_merge($menuButtonIds, $childIds);
        
        return $menuButtonIds;
    }
}
