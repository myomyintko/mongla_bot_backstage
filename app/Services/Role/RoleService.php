<?php

declare(strict_types=1);

namespace App\Services\Role;

use App\Repositories\Role\RoleRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Role;

class RoleService implements RoleServiceInterface
{
    public function __construct(
        private RoleRepositoryInterface $roleRepository
    ) {}

    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->roleRepository->getPaginated($filters, $perPage);
    }

    public function getById(int $id): ?Role
    {
        return $this->roleRepository->findById($id);
    }

    public function create(array $data): Role
    {
        return $this->roleRepository->create($data);
    }

    public function update(Role $role, array $data): Role
    {
        return $this->roleRepository->update($role, $data);
    }

    public function delete(Role $role): bool
    {
        return $this->roleRepository->delete($role);
    }

    public function getPermissions(): Collection
    {
        return $this->roleRepository->getAllPermissions();
    }

    /**
     * Get the repository instance (for transformation methods)
     */
    public function getRoleRepository(): RoleRepositoryInterface
    {
        return $this->roleRepository;
    }
}
