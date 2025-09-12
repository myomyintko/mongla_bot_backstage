<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User Management
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            
            // Store Management
            'stores.view',
            'stores.create',
            'stores.edit',
            'stores.delete',
            
            // Advertisement Management
            'advertisements.view',
            'advertisements.create',
            'advertisements.edit',
            'advertisements.delete',
            
            // Pin Message Management
            'pin-messages.view',
            'pin-messages.create',
            'pin-messages.edit',
            'pin-messages.delete',
            
            // Menu Button Management
            'menu-buttons.view',
            'menu-buttons.create',
            'menu-buttons.edit',
            'menu-buttons.delete',
            
            // Media Management
            'media.view',
            'media.upload',
            'media.delete',
            
            // Role & Permission Management
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',
            'permissions.view',
            'permissions.assign',
            
            // System Management
            'system.settings',
            'system.logs',
            'system.backup',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions
        $this->createSuperAdminRole();
        $this->createAdminRole();
        $this->createManagerRole();
        $this->createEditorRole();
        $this->createViewerRole();
    }

    private function createSuperAdminRole(): void
    {
        $role = Role::firstOrCreate(['name' => 'Super Admin']);
        $role->update([
            'display_name' => 'Super Administrator',
            'description' => 'Full system access with all permissions',
        ]);
        $role->syncPermissions(Permission::all());
    }

    private function createAdminRole(): void
    {
        $role = Role::firstOrCreate(['name' => 'Admin']);
        $role->update([
            'display_name' => 'Administrator',
            'description' => 'Administrative access to manage users and content',
        ]);
        $role->syncPermissions([
            'users.view',
            'users.create',
            'users.edit',
            'stores.view',
            'stores.create',
            'stores.edit',
            'stores.delete',
            'advertisements.view',
            'advertisements.create',
            'advertisements.edit',
            'advertisements.delete',
            'pin-messages.view',
            'pin-messages.create',
            'pin-messages.edit',
            'pin-messages.delete',
            'menu-buttons.view',
            'menu-buttons.create',
            'menu-buttons.edit',
            'menu-buttons.delete',
            'media.view',
            'media.upload',
            'media.delete',
            'roles.view',
            'permissions.view',
        ]);
    }

    private function createManagerRole(): void
    {
        $role = Role::firstOrCreate(['name' => 'Manager']);
        $role->update([
            'display_name' => 'Manager',
            'description' => 'Management access to stores and advertisements',
        ]);
        $role->syncPermissions([
            'users.view',
            'stores.view',
            'stores.create',
            'stores.edit',
            'advertisements.view',
            'advertisements.create',
            'advertisements.edit',
            'pin-messages.view',
            'pin-messages.create',
            'pin-messages.edit',
            'menu-buttons.view',
            'menu-buttons.create',
            'menu-buttons.edit',
            'media.view',
            'media.upload',
            'roles.view',
        ]);
    }

    private function createEditorRole(): void
    {
        $role = Role::firstOrCreate(['name' => 'Editor']);
        $role->update([
            'display_name' => 'Content Editor',
            'description' => 'Content editing permissions for stores and advertisements',
        ]);
        $role->syncPermissions([
            'users.view',
            'stores.view',
            'stores.create',
            'stores.edit',
            'advertisements.view',
            'advertisements.create',
            'advertisements.edit',
            'pin-messages.view',
            'pin-messages.create',
            'pin-messages.edit',
            'menu-buttons.view',
            'menu-buttons.create',
            'menu-buttons.edit',
            'media.view',
            'media.upload',
            'roles.view',
        ]);
    }

    private function createViewerRole(): void
    {
        $role = Role::firstOrCreate(['name' => 'Viewer']);
        $role->update([
            'display_name' => 'Viewer',
            'description' => 'Read-only access to view content',
        ]);
        $role->syncPermissions([
            'users.view',
            'stores.view',
            'advertisements.view',
            'pin-messages.view',
            'menu-buttons.view',
            'media.view',
            'roles.view',
        ]);
    }

    
}