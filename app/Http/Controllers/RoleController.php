<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Display a listing of roles
     */
    public function index(Request $request): JsonResponse
    {
        $query = Role::with(['permissions']);

        // Search by name
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Sort by name by default
        $query->orderBy('name');

        $roles = $query->paginate($request->get('per_page', 15));

        // Transform the response to match frontend expectations
        $roles->getCollection()->transform(function ($role) {
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
        });

        return response()->json($roles);
    }

    /**
     * Store a newly created role
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'display_name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'description' => $validated['description'],
            'guard_name' => 'web',
        ]);

        // Assign permissions if provided
        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json([
            'message' => 'Role created successfully',
            'role' => [
                'id' => (string) $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name,
                'description' => $role->description,
                'permissions_count' => $role->permissions->count(),
                'permissions' => $role->permissions->pluck('name'),
                'created_at' => $role->created_at,
                'updated_at' => $role->updated_at,
            ],
        ], 201);
    }

    /**
     * Display the specified role
     */
    public function show(Role $role): JsonResponse
    {
        return response()->json([
            'id' => (string) $role->id,
            'name' => $role->name,
            'display_name' => $role->display_name ?: $this->getDisplayName($role->name),
            'description' => $role->description ?: $this->getRoleDescription($role->name),
            'permissions_count' => $role->permissions->count(),
            'permissions' => $role->permissions->pluck('name'),
            'created_at' => $role->created_at,
            'updated_at' => $role->updated_at,
        ]);
    }

    /**
     * Update the specified role
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        // Prevent updating system roles
        if (in_array($role->name, ['Super Admin', 'Admin'])) {
            return response()->json([
                'message' => 'System roles cannot be modified',
            ], 422);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($role->id)],
            'display_name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'description' => $validated['description'],
        ]);

        // Update permissions if provided
        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json([
            'message' => 'Role updated successfully',
            'role' => [
                'id' => (string) $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name,
                'description' => $role->description,
                'permissions_count' => $role->permissions->count(),
                'permissions' => $role->permissions->pluck('name'),
                'created_at' => $role->created_at,
                'updated_at' => $role->updated_at,
            ],
        ]);
    }

    /**
     * Remove the specified role
     */
    public function destroy(Role $role): JsonResponse
    {
        // Prevent deleting system roles
        if (in_array($role->name, ['Super Admin', 'Admin'])) {
            return response()->json([
                'message' => 'System roles cannot be deleted',
            ], 422);
        }

        // Check if role has users assigned
        if ($role->users()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete role that has users assigned. Please reassign users first.',
            ], 422);
        }

        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully',
        ]);
    }

    /**
     * Get all available permissions
     */
    public function permissions(): JsonResponse
    {
        $permissions = Permission::all()->groupBy(function ($permission) {
            $parts = explode('.', $permission->name);
            return $parts[0] ?? 'other';
        });

        $groupedPermissions = [];
        foreach ($permissions as $group => $perms) {
            $groupedPermissions[] = [
                'group' => ucfirst(str_replace('-', ' ', $group)),
                'permissions' => $perms->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'display_name' => $this->getPermissionDisplayName($permission->name),
                    ];
                })->values(),
            ];
        }

        return response()->json($groupedPermissions);
    }

    /**
     * Get role display name
     */
    private function getDisplayName(string $roleName): string
    {
        $displayNames = [
            'Super Admin' => 'Super Administrator',
            'Admin' => 'Administrator',
            'Manager' => 'Manager',
            'Editor' => 'Content Editor',
            'Viewer' => 'Viewer',
        ];

        return $displayNames[$roleName] ?? $roleName;
    }

    /**
     * Get role description
     */
    private function getRoleDescription(string $roleName): string
    {
        $descriptions = [
            'Super Admin' => 'Full system access with all permissions',
            'Admin' => 'Administrative access to manage users and content',
            'Manager' => 'Management access to stores and advertisements',
            'Editor' => 'Content editing permissions for stores and advertisements',
            'Viewer' => 'Read-only access to view content',
        ];

        return $descriptions[$roleName] ?? 'Custom role';
    }

    /**
     * Get permission display name
     */
    private function getPermissionDisplayName(string $permissionName): string
    {
        $parts = explode('.', $permissionName);
        $action = $parts[1] ?? $permissionName;
        $resource = $parts[0] ?? '';

        $actionNames = [
            'view' => 'View',
            'create' => 'Create',
            'edit' => 'Edit',
            'delete' => 'Delete',
            'upload' => 'Upload',
            'assign' => 'Assign',
        ];

        $resourceNames = [
            'users' => 'Users',
            'roles' => 'Roles',
            'permissions' => 'Permissions',
            'stores' => 'Stores',
            'advertisements' => 'Advertisements',
            'pin-messages' => 'Pin Messages',
            'menu-buttons' => 'Menu Buttons',
            'media' => 'Media',
            'system' => 'System',
        ];

        $actionDisplay = $actionNames[$action] ?? ucfirst($action);
        $resourceDisplay = $resourceNames[$resource] ?? ucfirst(str_replace('-', ' ', $resource));

        return "{$actionDisplay} {$resourceDisplay}";
    }
}