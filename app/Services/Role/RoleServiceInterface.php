<?php

declare(strict_types=1);

namespace App\Services\Role;

use App\Repositories\Role\RoleRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Role;

interface RoleServiceInterface
{
    /**
     * Get paginated roles with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get a role by ID
     */
    public function getById(int $id): ?Role;

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
    public function getPermissions(): Collection;

    /**
     * Get the repository instance (for transformation methods)
     */
    public function getRoleRepository(): RoleRepositoryInterface;
}
