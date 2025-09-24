<?php

declare(strict_types=1);

namespace App\Services\Advertisement;

use App\Models\Advertisement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AdvertisementServiceInterface
{
    /**
     * Get paginated advertisements with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get an advertisement by ID
     */
    public function getById(int $id): ?Advertisement;

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
    public function bulkUpdate(array $ids, array $data): array;

    /**
     * Bulk delete advertisements
     */
    public function bulkDelete(array $ids): array;

    /**
     * Get advertisements ready to be sent based on date range, status, and frequency cap
     */
    public function getAdvertisementsReadyToSend(): array;

    /**
     * Send advertisement to a specific user (used by jobs)
     */
    public function sendAdvertisementToUserPrivate(Advertisement $advertisement, int $userId): array;


    /**
     * Record advertisement send for frequency cap tracking
     */
    public function recordAdvertisementSend(int $advertisementId, int $userId): void;

    /**
     * Process advertisement delivery to eligible users (automatically uses chunked delivery for large user bases)
     */
    public function processAdvertisementDelivery(Advertisement $advertisement, int $chunkSize = 100): array;
}
