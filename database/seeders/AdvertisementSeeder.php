<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Advertisement;
use App\Models\Store;
use Illuminate\Database\Seeder;

class AdvertisementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding advertisements...');

        // Create advertisements with different states
        $this->createRunningAdvertisements();
        $this->createScheduledAdvertisements();
        $this->createEndedAdvertisements();
        $this->createInactiveAdvertisements();
        $this->createStoreSpecificAdvertisements();

        $totalAdvertisements = Advertisement::count();
        $this->command->info("✅ Advertisements seeded successfully! Total: {$totalAdvertisements} advertisements");
    }

    /**
     * Create active running advertisements.
     */
    private function createRunningAdvertisements(): void
    {
        Advertisement::factory()
            ->count(2)
            ->active()
            ->running()
            ->create();

        $this->command->info('   🏃 Created 2 running advertisements');
    }

    /**
     * Create scheduled advertisements.
     */
    private function createScheduledAdvertisements(): void
    {
        Advertisement::factory()
            ->count(2)
            ->scheduled()
            ->create();

        $this->command->info('   📅 Created 2 scheduled advertisements');
    }

    /**
     * Create ended advertisements.
     */
    private function createEndedAdvertisements(): void
    {
        Advertisement::factory()
            ->count(2)
            ->ended()
            ->create();

        $this->command->info('   📊 Created 2 ended advertisements');
    }

    /**
     * Create inactive advertisements.
     */
    private function createInactiveAdvertisements(): void
    {
        Advertisement::factory()
            ->count(2)
            ->inactive()
            ->create();

        $this->command->info('   ⏸️ Created 2 inactive advertisements');
    }

    /**
     * Create store-specific advertisements.
     */
    private function createStoreSpecificAdvertisements(): void
    {
        // Create advertisements without stores
        // Advertisement::factory()
        //     ->count(3)
        //     ->withoutStore()
        //     ->active()
        //     ->create();

        // Create advertisements for specific stores
        $stores = Store::take(3)->get();
        $storeAdCount = 0;

        foreach ($stores as $store) {
            Advertisement::factory()
                ->count(2)
                ->forStore($store)
                ->active()
                ->running()
                ->create();
            
            $storeAdCount += 2;
        }

        $this->command->info("   🏪 Created 2 store-independent and {$storeAdCount} store-specific advertisements");
    }
}