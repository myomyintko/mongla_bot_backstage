<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding users...');

        // Create essential admin users
        $this->createDefaultSuperAdmin();

        $this->command->info('✅ Users seeded successfully!');
    }

    /**
     * Create essential admin users and real users.
     */
    private function createDefaultSuperAdmin(): void
    {
        // Create admin users
        $adminUsers = [
            [
                'email' => 'superadmin@monglabot.com',
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'password' => Hash::make('Qwer@001122'),
                'email_verified_at' => now(),
                'status' => User::STATUS_ACTIVE,
                'password_setup_required' => false, // All users need to setup password
            ],
            [
                'email' => 'admin@monglabot.com',
                'name' => 'Admin User',
                'username' => 'admin',
                'password' => Hash::make('Qwer@001122'),
                'email_verified_at' => now(),
                'status' => User::STATUS_ACTIVE,
                'password_setup_required' => false, // All users need to setup password
            ],
        ];

        foreach ($adminUsers as $userData) {
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
            
            // Assign roles based on email
            if ($userData['email'] === 'superadmin@monglabot.com' && !$user->hasRole('Super Admin')) {
                $user->assignRole('Super Admin');
                $this->command->info('   👑 Assigned Super Admin role to: ' . $user->name);
            } elseif ($userData['email'] === 'admin@monglabot.com' && !$user->hasRole('Admin')) {
                $user->assignRole('Admin');
                $this->command->info('   👤 Assigned Admin role to: ' . $user->name);
            }
        }

        $this->command->info('   👤 Created ' . count($adminUsers) . ' admin users');

        // Create test users with different roles
        $this->createTestUsers();
    }

    /**
     * Create real users with various roles and test data.
     */
    private function createTestUsers(): void
    {
        $testUsers = [
            // Managers - Active
            [
                'email' => 'john.smith@monglabot.com',
                'name' => 'John Smith',
                'username' => 'john.smith',
                'password' => Hash::make('Qwer@001122'),
                'email_verified_at' => now(),
                'status' => User::STATUS_ACTIVE,
                'role' => 'Manager',
            ],
            [
                'email' => 'sarah.johnson@monglabot.com',
                'name' => 'Sarah Johnson',
                'username' => 'sarah.johnson',
                'password' => Hash::make('Qwer@001122'),
                'email_verified_at' => now(),
                'status' => User::STATUS_ACTIVE,
                'role' => 'Manager',
            ],
            [
                'email' => 'michael.brown@monglabot.com',
                'name' => 'Michael Brown',
                'username' => 'michael.brown',
                'password' => Hash::make('Qwer@001122'),
                'email_verified_at' => now(),
                'status' => User::STATUS_ACTIVE,
                'role' => 'Manager',
            ],

            // Editors - Mixed statuses
            [
                'email' => 'emma.davis@monglabot.com',
                'name' => 'Emma Davis',
                'username' => 'emma.davis',
                'password' => Hash::make('Qwer@001122'),
                'email_verified_at' => now(),
                'status' => User::STATUS_ACTIVE,
                'role' => 'Editor',
            ],
            [
                'email' => 'david.wilson@monglabot.com',
                'name' => 'David Wilson',
                'username' => 'david.wilson',
                'password' => Hash::make('Qwer@001122'),
                'email_verified_at' => now(),
                'status' => User::STATUS_SUSPENDED,
                'role' => 'Editor',
            ],
            [
                'email' => 'lisa.garcia@monglabot.com',
                'name' => 'Lisa Garcia',
                'username' => 'lisa.garcia',
                'password' => Hash::make('Qwer@001122'),
                'email_verified_at' => now(),
                'status' => User::STATUS_INACTIVE,
                'role' => 'Editor',
            ],

            // Viewers - Mixed statuses
            [
                'email' => 'jennifer.anderson@monglabot.com',
                'name' => 'Jennifer Anderson',
                'username' => 'jennifer.anderson',
                'password' => Hash::make('Qwer@001122'),
                'email_verified_at' => now(),
                'status' => User::STATUS_ACTIVE,
                'role' => 'Viewer',
            ],
            [
                'email' => 'robert.taylor@monglabot.com',
                'name' => 'Robert Taylor',
                'username' => 'robert.taylor',
                'password' => Hash::make('Qwer@001122'),
                'email_verified_at' => now(),
                'status' => User::STATUS_SUSPENDED,
                'role' => 'Viewer',
            ],
            [
                'email' => 'amanda.thomas@monglabot.com',
                'name' => 'Amanda Thomas',
                'username' => 'amanda.thomas',
                'password' => Hash::make('Qwer@001122'),
                'email_verified_at' => now(),
                'status' => User::STATUS_INACTIVE,
                'role' => 'Viewer',
            ],
        ];

        $createdCount = 0;
        foreach ($testUsers as $userData) {
            $role = $userData['role'];
            unset($userData['role']); // Remove role from user data
            
            // Add password_setup_required field to all test users
            $userData['password_setup_required'] = true; // All users need to setup password

            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            // Assign role if user doesn't have it
            if (!$user->hasRole($role)) {
                $user->assignRole($role);
                $this->command->info("   👤 Assigned {$role} role to: {$user->name}");
                $createdCount++;
            }
        }

        $this->command->info("   👥 Created {$createdCount} real users with roles");
    }

}
