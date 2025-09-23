<?php

declare(strict_types=1);

namespace App\Repositories\MenuButton;

use App\Models\MenuButton;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class MenuButtonRepository implements MenuButtonRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = MenuButton::with(['parent', 'children']);

        // Filter by status if provided
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by button_type if provided
        if (isset($filters['button_type'])) {
            $query->where('button_type', $filters['button_type']);
        }

        // Filter by parent_id if provided
        if (isset($filters['parent_id'])) {
            if ($filters['parent_id'] === 'null') {
                $query->whereNull('parent_id');
            } elseif ($filters['parent_id'] === 'not_null') {
                $query->whereNotNull('parent_id');
            } else {
                $query->where('parent_id', $filters['parent_id']);
            }
        }

        // Search by name
        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        // Sort by sort field and then by created_at
        $query->orderBy('sort')->orderBy('created_at');

        return $query->paginate($perPage);
    }

    public function findById(int $id): ?MenuButton
    {
        return MenuButton::with(['parent', 'children', 'descendants'])->find($id);
    }

    public function create(array $data): MenuButton
    {
        // Set default values
        $data['status'] = $data['status'] ?? 1;
        $data['sort'] = $data['sort'] ?? 0;
        $data['enable_template'] = $data['enable_template'] ?? false;

        $menuButton = MenuButton::create($data);
        return $menuButton->load(['parent', 'children']);
    }

    public function update(MenuButton $menuButton, array $data): MenuButton
    {
        $menuButton->update($data);
        return $menuButton->fresh(['parent', 'children']);
    }

    public function delete(MenuButton $menuButton): bool
    {
        return $menuButton->delete();
    }

    public function bulkUpdate(array $ids, array $data): int
    {
        return MenuButton::whereIn('id', $ids)->update($data);
    }

    public function bulkDelete(array $ids): int
    {
        return MenuButton::whereIn('id', $ids)->delete();
    }

    public function getByIds(array $ids): Collection
    {
        return MenuButton::whereIn('id', $ids)->get();
    }

    public function getHierarchy(): Collection
    {
        return MenuButton::root()
            ->active()
            ->with(['children' => function ($query) {
                $query->active()->orderBy('sort');
            }])
            ->orderBy('sort')
            ->get();
    }

    public function hasChildren(MenuButton $menuButton): bool
    {
        return $menuButton->children()->count() > 0;
    }

    public function anyHaveChildren(array $ids): bool
    {
        return MenuButton::whereIn('id', $ids)
            ->whereHas('children')
            ->count() > 0;
    }

    public function getRootMenuButtons(int $limit = 16): Collection
    {
        return MenuButton::active()
            ->root()
            ->orderBy('sort')
            ->limit($limit)
            ->get();
    }

    public function getAll(): Collection
    {
        return MenuButton::active()
            ->orderBy('sort')
            ->get();
    }
}
