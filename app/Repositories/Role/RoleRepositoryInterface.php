<?php

declare(strict_types=1);

namespace App\Repositories\Role;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Role;

interface RoleRepositoryInterface
{
    /**
     * Get paginated roles with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Find a role by ID
     */
    public function findById(int $id): ?Role;

    /**
     * Create a new role
     */
    public function create(array $data): Role;

    /**
     * Update a role
     */
    public function update(Role $role, array $data): Role;

    /**
     * Delete a role
     */
    public function delete(Role $role): bool;

    /**
     * Get all permissions
     */
    public function getAllPermissions(): Collection;

    /**
     * Transform role data for API response
     */
    public function transformRoleData(Role $role): array;

    /**
     * Get display name for role
     */
    public function getDisplayName(string $roleName): string;

    /**
     * Get role description
     */
    public function getRoleDescription(string $roleName): string;
}
