<?php

declare(strict_types=1);

namespace App\Services\User;

use App\Models\User;
use App\Repositories\User\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface UserServiceInterface
{
    /**
     * Get paginated users with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get a user by ID
     */
    public function getById(int $id): ?User;

    /**
     * Create a new user
     */
    public function create(array $data): User;

    /**
     * Update a user
     */
    public function update(User $user, array $data): User;

    /**
     * Delete a user
     */
    public function delete(User $user): bool;

    /**
     * Bulk update users
     */
    public function bulkUpdate(array $userIds, array $data): array;

    /**
     * Bulk delete users
     */
    public function bulkDelete(array $userIds): array;

    /**
     * Get available roles
     */
    public function getRoles(): \Illuminate\Support\Collection;

    /**
     * Get available statuses
     */
    public function getStatuses(): array;

    /**
     * Validate user deletion
     */
    public function validateUserDeletion(User $user): array;

    /**
     * Validate bulk user deletion
     */
    public function validateBulkUserDeletion(array $userIds): array;

    /**
     * Get the repository instance (for transformation methods)
     */
    public function getUserRepository(): UserRepositoryInterface;
}
