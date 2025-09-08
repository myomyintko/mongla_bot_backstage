<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\MenuButton;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get menu buttons to associate with stores
        $foodMenuButton = MenuButton::where('name', 'like', '%Food%')->first();
        $shoppingMenuButton = MenuButton::where('name', 'like', '%Shopping%')->first();
        $entertainmentMenuButton = MenuButton::where('name', 'like', '%Entertainment%')->first();
        $beautyMenuButton = MenuButton::where('name', 'like', '%Beauty%')->first();
        $carMenuButton = MenuButton::where('name', 'like', '%Car%')->first();

        // Sample stores data
        $stores = [
            // Food stores
            [
                'name' => '🍔 Golden Dragon Restaurant',
                'description' => 'Authentic Chinese cuisine with a modern twist. Specializing in dim sum, hot pot, and traditional dishes.',
                'open_hour' => '10:00',
                'close_hour' => '22:00',
                'status' => 1,
                'address' => '123 Main Street, Downtown',
                'recommand' => true,
                'menu_button_id' => $foodMenuButton?->id,
            ],
            [
                'name' => '🍲 Spicy Hot Pot House',
                'description' => 'Experience the authentic Sichuan hot pot with fresh ingredients and traditional broth.',
                'open_hour' => '11:00',
                'close_hour' => '23:00',
                'status' => 1,
                'address' => '456 Food Court, Mall District',
                'recommand' => true,
                'menu_button_id' => $foodMenuButton?->id,
            ],
            [
                'name' => '🧋 Bubble Tea Paradise',
                'description' => 'Fresh bubble tea with premium ingredients. Over 50 flavors to choose from.',
                'open_hour' => '09:00',
                'close_hour' => '21:00',
                'status' => 1,
                'address' => '789 Student Street, University Area',
                'recommand' => false,
                'menu_button_id' => $foodMenuButton?->id,
            ],
            [
                'name' => '🍜 Noodle Master',
                'description' => 'Handmade noodles with rich broth and fresh vegetables. A local favorite.',
                'open_hour' => '08:00',
                'close_hour' => '20:00',
                'status' => 1,
                'address' => '321 Old Town, Historic District',
                'recommand' => false,
                'menu_button_id' => $foodMenuButton?->id,
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
                'menu_button_id' => $shoppingMenuButton?->id,
            ],
            [
                'name' => '📱 Tech World Electronics',
                'description' => 'Latest smartphones, laptops, and gadgets. Authorized dealer with warranty.',
                'open_hour' => '10:00',
                'close_hour' => '21:00',
                'status' => 1,
                'address' => '777 Tech Hub, Innovation Center',
                'recommand' => true,
                'menu_button_id' => $shoppingMenuButton?->id,
            ],
            [
                'name' => '💄 Beauty Plus Cosmetics',
                'description' => 'Premium cosmetics and skincare products from international brands.',
                'open_hour' => '09:00',
                'close_hour' => '20:00',
                'status' => 1,
                'address' => '999 Fashion Mall, Style District',
                'recommand' => false,
                'menu_button_id' => $shoppingMenuButton?->id,
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
                'menu_button_id' => $entertainmentMenuButton?->id,
            ],
            [
                'name' => '🍺 The Local Pub',
                'description' => 'Cozy pub with craft beers, live music, and traditional pub food.',
                'open_hour' => '16:00',
                'close_hour' => '01:00',
                'status' => 1,
                'address' => '222 Heritage Lane, Old Quarter',
                'recommand' => false,
                'menu_button_id' => $entertainmentMenuButton?->id,
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
                'menu_button_id' => $beautyMenuButton?->id,
            ],
            [
                'name' => '💅 Nail Art Studio',
                'description' => 'Creative nail art, manicures, pedicures, and nail extensions.',
                'open_hour' => '10:00',
                'close_hour' => '20:00',
                'status' => 1,
                'address' => '444 Wellness Center, Health Plaza',
                'recommand' => false,
                'menu_button_id' => $beautyMenuButton?->id,
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
                'menu_button_id' => $carMenuButton?->id,
            ],
            [
                'name' => '🚙 Premium Car Dealership',
                'description' => 'New and used cars, financing options, and after-sales service.',
                'open_hour' => '09:00',
                'close_hour' => '19:00',
                'status' => 1,
                'address' => '666 Auto Mall, Vehicle District',
                'recommand' => false,
                'menu_button_id' => $carMenuButton?->id,
            ],
        ];

        // Create stores
        foreach ($stores as $storeData) {
            Store::create($storeData);
        }

        // Create additional stores using factory
        Store::factory()
            ->count(20)
            ->active()
            ->create();

        $this->command->info('Stores seeded successfully with ' . count($stores) . ' sample stores and 20 additional stores!');
    }
}
