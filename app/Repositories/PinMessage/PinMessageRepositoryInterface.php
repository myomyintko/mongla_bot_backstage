<?php

declare(strict_types=1);

namespace App\Repositories\PinMessage;

use App\Models\PinMessage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PinMessageRepositoryInterface
{
    /**
     * Get paginated pin messages with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Find a pin message by ID
     */
    public function findById(int $id): ?PinMessage;

    /**
     * Create a new pin message
     */
    public function create(array $data): PinMessage;

    /**
     * Update a pin message
     */
    public function update(PinMessage $pinMessage, array $data): PinMessage;

    /**
     * Delete a pin message
     */
    public function delete(PinMessage $pinMessage): bool;

    /**
     * Bulk update pin messages
     */
    public function bulkUpdate(array $ids, array $data): int;

    /**
     * Bulk delete pin messages
     */
    public function bulkDelete(array $ids): int;

    /**
     * Get pin messages by IDs
     */
    public function getByIds(array $ids): Collection;
}
