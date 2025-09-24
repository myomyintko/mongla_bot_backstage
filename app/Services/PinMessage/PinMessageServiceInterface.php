<?php

declare(strict_types=1);

namespace App\Services\PinMessage;

use App\Models\PinMessage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PinMessageServiceInterface
{
    /**
     * Get paginated pin messages with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get a pin message by ID
     */
    public function getById(int $id): ?PinMessage;

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
    public function bulkUpdate(array $ids, array $data): array;

    /**
     * Bulk delete pin messages
     */
    public function bulkDelete(array $ids): array;
}
