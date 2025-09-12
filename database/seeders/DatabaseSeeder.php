<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting database seeding...');
        $startTime = microtime(true);

        // Disable foreign key checks for better performance
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        try {
            // Seed in dependency order
            $this->seedCoreData();
            $this->seedBusinessData();
            $this->seedContentData();

            $this->command->info('✅ Database seeding completed successfully!');
        } catch (\Exception $e) {
            $this->command->error('❌ Database seeding failed: ' . $e->getMessage());
            throw $e;
        } finally {
            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        $endTime = microtime(true);
        $executionTime = round($endTime - $startTime, 2);
        $this->command->info("⏱️ Total execution time: {$executionTime} seconds");
    }

    /**
     * Seed core data (users, menu buttons).
     */
    private function seedCoreData(): void
    {
        $this->command->info('📋 Seeding core data...');
        
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
            MenuButtonSeeder::class,
        ]);
        
        $this->command->info('   ✅ Core data seeded successfully');
    }

    /**
     * Seed business data (stores, advertisements).
     */
    private function seedBusinessData(): void
    {
        $this->command->info('🏢 Seeding business data...');
        
        $this->call([
            StoreSeeder::class,
            AdvertisementSeeder::class,
        ]);
    }

    /**
     * Seed content data (pin messages).
     */
    private function seedContentData(): void
    {
        $this->command->info('📝 Seeding content data...');
        
        $this->call([
            PinMessageSeeder::class,
        ]);
    }
}
