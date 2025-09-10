<?php

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
        echo "Seeding advertisements...\n";

        // Create some active running advertisements
        Advertisement::factory()
            ->count(5)
            ->active()
            ->running()
            ->create();

        // Create some scheduled advertisements
        Advertisement::factory()
            ->count(3)
            ->scheduled()
            ->create();

        // Create some ended advertisements
        Advertisement::factory()
            ->count(2)
            ->ended()
            ->create();

        // Create some inactive advertisements
        Advertisement::factory()
            ->count(2)
            ->inactive()
            ->create();

        // Create some advertisements without stores
        Advertisement::factory()
            ->count(3)
            ->withoutStore()
            ->active()
            ->create();

        // Create advertisements for specific stores
        $stores = Store::take(3)->get();
        foreach ($stores as $store) {
            Advertisement::factory()
                ->count(2)
                ->forStore($store)
                ->active()
                ->running()
                ->create();
        }

        $totalAdvertisements = Advertisement::count();
        echo "✅ Advertisements seeded successfully! Created {$totalAdvertisements} advertisements.\n";
    }
}