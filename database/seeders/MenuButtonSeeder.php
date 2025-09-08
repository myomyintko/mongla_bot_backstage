<?php

namespace Database\Seeders;

use App\Models\MenuButton;
use Illuminate\Database\Seeder;

class MenuButtonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menus = [
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

        // Create main menu buttons
        foreach ($menus as $menu) {
            $parentMenu = MenuButton::create([
                'name' => $menu['emoji'] . ' ' . $menu['label'],
                'button_type' => 'store',
                'sort' => $menu['sort'],
                'status' => 1,
                'enable_template' => true,
                'template_content' => 'Welcome to ' . $menu['label'] . ' services! Please select an option below.',
            ]);

            // Create sub-menu buttons
            foreach ($menu['sub'] as $index => $subMenu) {
                MenuButton::create([
                    'parent_id' => $parentMenu->id,
                    'name' => $subMenu[0] . ' ' . $subMenu[1],
                    'button_type' => 'store',
                    'sort' => $index + 1,
                    'status' => 1,
                    'enable_template' => false,
                ]);
            }
        }

        $this->command->info('Menu buttons seeded successfully with ' . count($menus) . ' main categories!');
    }
}