<?php

declare(strict_types=1);

namespace App\Repositories\Role;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleRepository implements RoleRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Role::with(['permissions']);

        // Search by name
        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        // Sort by name by default
        $query->orderBy('name');

        $roles = $query->paginate($perPage);

        // Transform the response to match frontend expectations
        $roles->getCollection()->transform(function ($role) {
            return $this->transformRoleData($role);
        });

        return $roles;
    }

    public function findById(int $id): ?Role
    {
        return Role::with(['permissions'])->find($id);
    }

    public function create(array $data): Role
    {
        $role = Role::create([
            'name' => $data['name'],
            'display_name' => $data['display_name'] ?? null,
            'description' => $data['description'] ?? null,
        ]);

        // Assign permissions if provided
        if (!empty($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role->load('permissions');
    }

    public function update(Role $role, array $data): Role
    {
        $role->update([
            'name' => $data['name'],
            'display_name' => $data['display_name'] ?? null,
            'description' => $data['description'] ?? null,
        ]);

        // Update permissions if provided
        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role->fresh(['permissions']);
    }

    public function delete(Role $role): bool
    {
        return $role->delete();
    }

    public function getAllPermissions(): Collection
    {
        return Permission::all();
    }

    public function transformRoleData(Role $role): array
    {
        return [
            'id' => (string) $role->id,
            'name' => $role->name,
            'display_name' => $role->display_name ?: $this->getDisplayName($role->name),
            'description' => $role->description ?: $this->getRoleDescription($role->name),
            'permissions_count' => $role->permissions->count(),
            'permissions' => $role->permissions->pluck('name'),
            'created_at' => $role->created_at,
            'updated_at' => $role->updated_at,
        ];
    }

    public function getDisplayName(string $roleName): string
    {
        return match ($roleName) {
            'Super Admin' => 'Super Administrator',
            'Admin' => 'Administrator',
            'Manager' => 'Manager',
            'Editor' => 'Editor',
            'Viewer' => 'Viewer',
            default => ucwords(str_replace('_', ' ', $roleName)),
        };
    }

    public function getRoleDescription(string $roleName): string
    {
        return match ($roleName) {
            'Super Admin' => 'Full system access with all permissions',
            'Admin' => 'Administrative access with most permissions',
            'Manager' => 'Management access with limited administrative permissions',
            'Editor' => 'Content editing permissions',
            'Viewer' => 'Read-only access to the system',
            default => 'Custom role with specific permissions',
        };
    }
}
