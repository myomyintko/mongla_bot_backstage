<?php

declare(strict_types=1);

namespace App\Repositories\PinMessage;

use App\Models\PinMessage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PinMessageRepository implements PinMessageRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = PinMessage::query();

        // Filter by status if provided
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Search by content
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', '%' . $search . '%')
                  ->orWhere('btn_name', 'like', '%' . $search . '%')
                  ->orWhere('btn_link', 'like', '%' . $search . '%');
            });
        }

        return $query->paginate($perPage);
    }

    public function findById(int $id): ?PinMessage
    {
        return PinMessage::find($id);
    }

    public function create(array $data): PinMessage
    {
        // Set default values
        $data['status'] = $data['status'] ?? 1;
        $data['sort'] = $data['sort'] ?? 0;

        return PinMessage::create($data);
    }

    public function update(PinMessage $pinMessage, array $data): PinMessage
    {
        $pinMessage->update($data);
        return $pinMessage->fresh();
    }

    public function delete(PinMessage $pinMessage): bool
    {
        return $pinMessage->delete();
    }

    public function bulkUpdate(array $ids, array $data): int
    {
        return PinMessage::whereIn('id', $ids)->update($data);
    }

    public function bulkDelete(array $ids): int
    {
        return PinMessage::whereIn('id', $ids)->delete();
    }

    public function getByIds(array $ids): Collection
    {
        return PinMessage::whereIn('id', $ids)->get();
    }
}
