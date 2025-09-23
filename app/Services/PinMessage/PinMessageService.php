<?php

declare(strict_types=1);

namespace App\Services\PinMessage;

use App\Models\PinMessage;
use App\Repositories\PinMessage\PinMessageRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PinMessageService implements PinMessageServiceInterface
{
    public function __construct(
        private PinMessageRepositoryInterface $pinMessageRepository
    ) {}

    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->pinMessageRepository->getPaginated($filters, $perPage);
    }

    public function getById(int $id): ?PinMessage
    {
        return $this->pinMessageRepository->findById($id);
    }

    public function create(array $data): PinMessage
    {
        return $this->pinMessageRepository->create($data);
    }

    public function update(PinMessage $pinMessage, array $data): PinMessage
    {
        return $this->pinMessageRepository->update($pinMessage, $data);
    }

    public function delete(PinMessage $pinMessage): bool
    {
        return $this->pinMessageRepository->delete($pinMessage);
    }

    public function bulkUpdate(array $ids, array $data): array
    {
        $updatedCount = $this->pinMessageRepository->bulkUpdate($ids, $data);

        return [
            'message' => "Updated {$updatedCount} pin messages successfully"
        ];
    }

    public function bulkDelete(array $ids): array
    {
        $deletedCount = $this->pinMessageRepository->bulkDelete($ids);

        return [
            'message' => "Deleted {$deletedCount} pin messages successfully"
        ];
    }
}
