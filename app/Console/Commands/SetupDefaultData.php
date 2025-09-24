<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\MenuButton;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class SetupDefaultData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'setup:default-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup default data (users, roles, permissions, menu buttons) for production';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🚀 Setting up default data for production...');

        // Setup roles and permissions first
        $this->setupRolesAndPermissions();

        // Setup default users
        $this->setupDefaultUsers();

        // Setup menu buttons
        $this->setupMenuButtons();

        $this->info('✅ Default data setup completed successfully!');

        return self::SUCCESS;
    }

    /**
     * Setup roles and permissions
     */
    private function setupRolesAndPermissions(): void
    {
        $this->info('📋 Setting up roles and permissions...');

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

            // Telegraph Management
            'telegraph.view',
            'telegraph.create',
            'telegraph.edit',
            'telegraph.delete',

            // Bot Template Management
            'bot-templates.view',
            'bot-templates.create',
            'bot-templates.edit',
            'bot-templates.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $this->info('   ✅ Created ' . count($permissions) . ' permissions');

        // Create roles
        $this->createSuperAdminRole();
        $this->createAdminRole();
        $this->createManagerRole();
        $this->createEditorRole();
        $this->createViewerRole();

        $this->info('   ✅ Created 5 roles with permissions');
    }

    /**
     * Setup default users
     */
    private function setupDefaultUsers(): void
    {
        $this->info('👤 Setting up default users...');

        // Create essential admin users only
        $adminUsers = [
            [
                'email' => 'superadmin@monglabot.com',
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'password' => Hash::make('Qwer@001122'),
                'email_verified_at' => now(),
                'status' => User::STATUS_ACTIVE,
                'password_setup_required' => false,
                'role' => 'Super Admin',
            ],
            [
                'email' => 'admin@monglabot.com',
                'name' => 'Admin User',
                'username' => 'admin',
                'password' => Hash::make('Qwer@001122'),
                'email_verified_at' => now(),
                'status' => User::STATUS_ACTIVE,
                'password_setup_required' => false,
                'role' => 'Admin',
            ],
        ];

        foreach ($adminUsers as $userData) {
            $role = $userData['role'];
            unset($userData['role']);

            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            // Assign role if user doesn't have it
            if (!$user->hasRole($role)) {
                $user->assignRole($role);
                $this->info("   👑 Assigned {$role} role to: {$user->name}");
            }
        }

        $this->info('   ✅ Created ' . count($adminUsers) . ' admin users');
    }

    /**
     * Setup menu buttons
     */
    private function setupMenuButtons(): void
    {
        $this->info('🔘 Setting up menu buttons...');

        $menus = $this->getMenuData();
        $createdMenus = [];

        // Create main menu buttons
        foreach ($menus as $menu) {
            $menuName = $menu['emoji'] . ' ' . $menu['label'];

            $parentMenu = MenuButton::updateOrCreate(
                ['name' => $menuName],
                [
                    'button_type' => 'store',
                    'sort' => $menu['sort'],
                    'status' => 1,
                    'enable_template' => false,
                    'template_content' => 'Welcome to ' . $menu['label'] . ' services! Please select an option below.',
                ]
            );

            $createdMenus[$menuName] = $parentMenu;

            // Create sub-menu buttons
            if (!empty($menu['sub'])) {
                foreach ($menu['sub'] as $index => $subMenu) {
                    $subMenuName = $subMenu[0] . ' ' . $subMenu[1];

                    MenuButton::updateOrCreate(
                        [
                            'name' => $subMenuName,
                            'parent_id' => $parentMenu->id,
                        ],
                        [
                            'button_type' => 'store',
                            'sort' => $index + 1,
                            'status' => 1,
                            'enable_template' => false,
                        ]
                    );
                }
            }
        }

        $totalMenus = count($createdMenus);
        $totalSubMenus = MenuButton::whereNotNull('parent_id')->count();

        $this->info("   ✅ Created {$totalMenus} main menu categories and {$totalSubMenus} sub-categories");
    }

    /**
     * Create Super Admin role
     */
    private function createSuperAdminRole(): void
    {
        $role = Role::firstOrCreate(['name' => 'Super Admin']);
        $role->update([
            'display_name' => 'Super Administrator',
            'description' => 'Full system access with all permissions',
        ]);
        $role->syncPermissions(Permission::all());
    }

    /**
     * Create Admin role
     */
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
            'telegraph.view',
            'telegraph.create',
            'telegraph.edit',
            'telegraph.delete',
            'bot-templates.view',
            'bot-templates.create',
            'bot-templates.edit',
            'bot-templates.delete',
        ]);
    }

    /**
     * Create Manager role
     */
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
            'bot-templates.view',
            'bot-templates.create',
            'bot-templates.edit',
        ]);
    }

    /**
     * Create Editor role
     */
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
            'bot-templates.view',
            'bot-templates.create',
            'bot-templates.edit',
        ]);
    }

    /**
     * Create Viewer role
     */
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
            'bot-templates.view',
        ]);
    }

    /**
     * Get the menu data structure
     */
    private function getMenuData(): array
    {
        return [
            [
                'emoji' => '🍽️',
                'label' => 'Food',
                'sort' => 2,
                'sub' => [
                    ['🍔', 'Restaurant'],
                    ['🍲', 'Hot Pot'],
                    ['🍡', 'Barbecue'],
                    ['🧋', 'Milk Tea'],
                    ['🍩', 'Snacks'],
                    ['🍜', 'Noodles'],
                    ['🍉', 'Fruits'],
                    ['🦀', 'Seafood'],
                    ['🍲', 'Rice Noodles'],
                ],
            ],
            [
                'emoji' => '🏨',
                'label' => 'Hotels',
                'sort' => 3,
                'sub' => [],
            ],
            [
                'emoji' => '🛍️',
                'label' => 'Shopping',
                'sort' => 4,
                'sub' => [
                    ['🛒', 'Supermarket'],
                    ['🧥', 'Clothing'],
                    ['🎀', 'Accessories'],
                    ['🚛', 'Proxy Shopping'],
                    ['📱', 'Electronics'],
                    ['💄', 'Cosmetics'],
                    ['🧺', 'Laundry'],
                    ['🏬', 'Local Shops'],
                    ['🔞', 'Adult Products'],
                ],
            ],
            [
                'emoji' => '💵',
                'label' => 'Currency Exchange',
                'sort' => 5,
                'sub' => [],
            ],
            [
                'emoji' => '🏡',
                'label' => 'Rental',
                'sort' => 8,
                'sub' => [],
            ],
            [
                'emoji' => '🏥',
                'label' => 'Hospitals',
                'sort' => 9,
                'sub' => [],
            ],
            [
                'emoji' => '🥳',
                'label' => 'Entertainment',
                'sort' => 10,
                'sub' => [
                    ['🕺🕺', 'Club'],
                    ['🍺', 'Bar/KTV'],
                    ['🧖‍♂️', 'Massage'],
                    ['🧘‍♀️', 'Wellness'],
                ],
            ],
            [
                'emoji' => '💆‍♀️',
                'label' => 'Beauty Salon',
                'sort' => 11,
                'sub' => [
                    ['💇‍♂️', 'Hair'],
                    ['💅', 'Nails & Beauty'],
                    ['💉', 'Medical Beauty'],
                    ['🕸️', 'Tattoo'],
                ],
            ],
            [
                'emoji' => '🚗',
                'label' => 'Car Services',
                'sort' => 14,
                'sub' => [
                    ['🛞', 'Car Repair'],
                    ['🚙', 'Buy & Sell Cars'],
                ],
            ],
            [
                'emoji' => '📦',
                'label' => 'Express Delivery',
                'sort' => 15,
                'sub' => [
                    ['🎁', 'Asia Express'],
                    ['🏃‍♂️', 'Errand Services'],
                ],
            ],
        ];
    }
}