<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Store;
use App\Models\MenuButton;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding stores...');

        // Get menu buttons to associate with stores
        $menuButtons = $this->getMenuButtons();

        // Create sample stores
        $this->createSampleStores($menuButtons);

        // Create additional stores using factory
        $this->createFactoryStores($menuButtons);

        $totalStores = Store::count();
        $this->command->info("✅ Stores seeded successfully! Total: {$totalStores} stores");
    }

    /**
     * Get menu buttons for store association.
     */
    private function getMenuButtons(): array
    {
        return [
            'food' => MenuButton::where('name', 'like', '%Food%')->whereNull('parent_id')->first(),
            'shopping' => MenuButton::where('name', 'like', '%Shopping%')->whereNull('parent_id')->first(),
            'entertainment' => MenuButton::where('name', 'like', '%Entertainment%')->whereNull('parent_id')->first(),
            'beauty' => MenuButton::where('name', 'like', '%Beauty%')->whereNull('parent_id')->first(),
            'car' => MenuButton::where('name', 'like', '%Car%')->whereNull('parent_id')->first(),
        ];
    }

    /**
     * Create sample stores with predefined data.
     */
    private function createSampleStores(array $menuButtons): void
    {
        $stores = $this->getSampleStoreData($menuButtons);
        $storeData = [];

        foreach ($stores as $store) {
            $storeData[] = array_merge($store, [
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Batch insert stores
        DB::table('stores')->insert($storeData);

        $this->command->info('   🏪 Created ' . count($stores) . ' sample stores');
    }

    /**
     * Create additional stores using factory.
     */
    private function createFactoryStores(array $menuButtons): void
    {
        $factoryCount = 20;
        
        // Create stores with different categories
        $categories = ['food', 'shopping', 'services'];
        $storesPerCategory = intval($factoryCount / count($categories));

        foreach ($categories as $category) {
            $menuButton = $menuButtons[$category] ?? null;
            
            Store::factory()
                ->count($storesPerCategory)
                ->active()
                ->when($menuButton, fn($factory) => $factory->forMenuButton($menuButton))
                ->create();
        }

        // Create remaining stores
        $remaining = $factoryCount - ($storesPerCategory * count($categories));
        if ($remaining > 0) {
            Store::factory()
                ->count($remaining)
                ->active()
                ->create();
        }

        $this->command->info("   🏭 Created {$factoryCount} factory-generated stores");
    }

    /**
     * Get sample store data.
     */
    private function getSampleStoreData(array $menuButtons): array
    {
        return [
            // Food stores
            [
                'name' => '🍔 Golden Dragon Restaurant',
                'description' => 'Authentic Chinese cuisine with a modern twist. Specializing in dim sum, hot pot, and traditional dishes.',
                'open_hour' => '10:00',
                'close_hour' => '22:00',
                'status' => 1,
                'address' => '123 Main Street, Downtown',
                'recommand' => true,
                'menu_button_id' => $menuButtons['food']?->id,
                'media_url' => null,
                'menu_urls' => null,
                'sub_btns' => null,
            ],
            [
                'name' => '🍲 Spicy Hot Pot House',
                'description' => 'Experience the authentic Sichuan hot pot with fresh ingredients and traditional broth.',
                'open_hour' => '11:00',
                'close_hour' => '23:00',
                'status' => 1,
                'address' => '456 Food Court, Mall District',
                'recommand' => true,
                'menu_button_id' => $menuButtons['food']?->id,
                'media_url' => null,
                'menu_urls' => null,
                'sub_btns' => null,
            ],
            [
                'name' => '🧋 Bubble Tea Paradise',
                'description' => 'Fresh bubble tea with premium ingredients. Over 50 flavors to choose from.',
                'open_hour' => '09:00',
                'close_hour' => '21:00',
                'status' => 1,
                'address' => '789 Student Street, University Area',
                'recommand' => false,
                'menu_button_id' => $menuButtons['food']?->id,
                'media_url' => null,
                'menu_urls' => null,
                'sub_btns' => null,
            ],
            [
                'name' => '🍜 Noodle Master',
                'description' => 'Handmade noodles with rich broth and fresh vegetables. A local favorite.',
                'open_hour' => '08:00',
                'close_hour' => '20:00',
                'status' => 1,
                'address' => '321 Old Town, Historic District',
                'recommand' => false,
                'menu_button_id' => $menuButtons['food']?->id,
                'media_url' => null,
                'menu_urls' => null,
                'sub_btns' => null,
            ],

            // Shopping stores
            [
                'name' => '🛒 Mega Supermarket',
                'description' => 'One-stop shopping for all your daily needs. Fresh produce, household items, and more.',
                'open_hour' => '07:00',
                'close_hour' => '22:00',
                'status' => 1,
                'address' => '555 Commercial Plaza, Business District',
                'recommand' => true,
                'menu_button_id' => $menuButtons['shopping']?->id,
                'media_url' => null,
                'menu_urls' => null,
                'sub_btns' => null,
            ],
            [
                'name' => '📱 Tech World Electronics',
                'description' => 'Latest smartphones, laptops, and gadgets. Authorized dealer with warranty.',
                'open_hour' => '10:00',
                'close_hour' => '21:00',
                'status' => 1,
                'address' => '777 Tech Hub, Innovation Center',
                'recommand' => true,
                'menu_button_id' => $menuButtons['shopping']?->id,
                'media_url' => null,
                'menu_urls' => null,
                'sub_btns' => null,
            ],
            [
                'name' => '💄 Beauty Plus Cosmetics',
                'description' => 'Premium cosmetics and skincare products from international brands.',
                'open_hour' => '09:00',
                'close_hour' => '20:00',
                'status' => 1,
                'address' => '999 Fashion Mall, Style District',
                'recommand' => false,
                'menu_button_id' => $menuButtons['shopping']?->id,
                'media_url' => null,
                'menu_urls' => null,
                'sub_btns' => null,
            ],

            // Entertainment stores
            [
                'name' => '🕺🕺 Club Neon',
                'description' => 'Premier nightclub with live DJs, premium drinks, and VIP service.',
                'open_hour' => '20:00',
                'close_hour' => '04:00',
                'status' => 1,
                'address' => '111 Nightlife Street, Entertainment District',
                'recommand' => true,
                'menu_button_id' => $menuButtons['entertainment']?->id,
                'media_url' => null,
                'menu_urls' => null,
                'sub_btns' => null,
            ],
            [
                'name' => '🍺 The Local Pub',
                'description' => 'Cozy pub with craft beers, live music, and traditional pub food.',
                'open_hour' => '16:00',
                'close_hour' => '01:00',
                'status' => 1,
                'address' => '222 Heritage Lane, Old Quarter',
                'recommand' => false,
                'menu_button_id' => $menuButtons['entertainment']?->id,
                'media_url' => null,
                'menu_urls' => null,
                'sub_btns' => null,
            ],

            // Beauty services
            [
                'name' => '💇‍♂️ Style Studio Hair Salon',
                'description' => 'Professional hair styling, coloring, and treatments by experienced stylists.',
                'open_hour' => '09:00',
                'close_hour' => '19:00',
                'status' => 1,
                'address' => '333 Beauty Avenue, Style District',
                'recommand' => true,
                'menu_button_id' => $menuButtons['beauty']?->id,
                'media_url' => null,
                'menu_urls' => null,
                'sub_btns' => null,
            ],
            [
                'name' => '💅 Nail Art Studio',
                'description' => 'Creative nail art, manicures, pedicures, and nail extensions.',
                'open_hour' => '10:00',
                'close_hour' => '20:00',
                'status' => 1,
                'address' => '444 Wellness Center, Health Plaza',
                'recommand' => false,
                'menu_button_id' => $menuButtons['beauty']?->id,
                'media_url' => null,
                'menu_urls' => null,
                'sub_btns' => null,
            ],

            // Car services
            [
                'name' => '🛞 AutoCare Service Center',
                'description' => 'Complete car maintenance, repairs, and diagnostics. Certified mechanics.',
                'open_hour' => '08:00',
                'close_hour' => '18:00',
                'status' => 1,
                'address' => '555 Industrial Road, Service District',
                'recommand' => true,
                'menu_button_id' => $menuButtons['car']?->id,
                'media_url' => null,
                'menu_urls' => null,
                'sub_btns' => null,
            ],
            [
                'name' => '🚙 Premium Car Dealership',
                'description' => 'New and used cars, financing options, and after-sales service.',
                'open_hour' => '09:00',
                'close_hour' => '19:00',
                'status' => 1,
                'address' => '666 Auto Mall, Vehicle District',
                'recommand' => false,
                'menu_button_id' => $menuButtons['car']?->id,
                'media_url' => null,
                'menu_urls' => null,
                'sub_btns' => null,
            ],
        ];
    }
}
