<?php

declare(strict_types=1);

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
        $this->command->info('🌱 Seeding menu buttons...');

        // Only clear if we're doing a fresh seed (not in production)
        if (app()->environment('local', 'testing')) {
            MenuButton::truncate();
        }

        $menus = $this->getMenuData();
        $createdMenus = [];

        // Create main menu buttons using updateOrCreate to avoid conflicts
        foreach ($menus as $menu) {
            $menuName = $menu['emoji'] . ' ' . $menu['label'];
            
            $parentMenu = MenuButton::updateOrCreate(
                ['name' => $menuName],
                [
                    'button_type' => 'store',
                    'sort' => $menu['sort'],
                    'status' => 1,
                    'enable_template' => true,
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

        $this->command->info("✅ Menu buttons seeded successfully!");
        $this->command->info("   📊 Created/Updated {$totalMenus} main categories and {$totalSubMenus} sub-categories");
    }

    /**
     * Get the menu data structure.
     *
     * @return array
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