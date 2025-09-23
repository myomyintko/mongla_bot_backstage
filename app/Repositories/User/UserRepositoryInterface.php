<?php

declare(strict_types=1);

namespace App\Repositories\User;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    /**
     * Get paginated users with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Find a user by ID
     */
    public function findById(int $id): ?User;

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
    public function bulkUpdate(array $userIds, array $data): int;

    /**
     * Bulk delete users
     */
    public function bulkDelete(array $userIds): int;

    /**
     * Get users by IDs
     */
    public function getByIds(array $ids): Collection;

    /**
     * Check if user is the last Super Admin
     */
    public function isLastSuperAdmin(User $user): bool;

    /**
     * Get Super Admin count
     */
    public function getSuperAdminCount(): int;

    /**
     * Get all roles
     */
    public function getAllRoles(): \Illuminate\Support\Collection;

    /**
     * Transform user data for API response
     */
    public function transformUserData(User $user): array;

    /**
     * Transform users collection for API response
     */
    public function transformUsersCollection(Collection $users): Collection;
}
