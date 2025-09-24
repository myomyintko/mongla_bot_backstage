<?php

declare(strict_types=1);

namespace App\Repositories\Advertisement;

use App\Models\Advertisement;
use App\Models\AdvertisementSend;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface AdvertisementRepositoryInterface
{
    /**
     * Get paginated advertisements with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Find an advertisement by ID
     */
    public function findById(int $id): ?Advertisement;

    /**
     * Create a new advertisement
     */
    public function create(array $data): Advertisement;

    /**
     * Update an advertisement
     */
    public function update(Advertisement $advertisement, array $data): Advertisement;

    /**
     * Delete an advertisement
     */
    public function delete(Advertisement $advertisement): bool;

    /**
     * Bulk update advertisements
     */
    public function bulkUpdate(array $ids, array $data): int;

    /**
     * Bulk delete advertisements
     */
    public function bulkDelete(array $ids): int;

    /**
     * Get advertisements by IDs
     */
    public function getByIds(array $ids): Collection;

    /**
     * Get advertisements ready to be sent (active, within date range)
     */
    public function getReadyToSend(): Collection;

    /**
     * Get advertisement send history for frequency cap checking
     */
    public function getSendHistory(int $advertisementId, int $userId, int $minutes): Collection;

    /**
     * Get the last send time for an advertisement to a user
     */
    public function getLastSend(int $advertisementId, int $userId): ?AdvertisementSend;

    /**
     * Record advertisement send
     */
    public function recordSend(int $advertisementId, int $userId): void;
}
