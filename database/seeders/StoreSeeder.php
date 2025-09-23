<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Store;
use App\Models\MenuButton;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding stores...');

        // Clear existing stores
        Store::query()->delete();

        // Reset the factory's name counter
        \Database\Factories\StoreFactory::resetNameCounter();

        // Get all menu buttons (both main and subcategories)
        $menuButtons = $this->getAllMenuButtons();

        // Create stores for each menu button
        $this->createStoresForMenuButtons($menuButtons);

        $totalStores = Store::count();
        $this->command->info("✅ Stores seeded successfully! Total: {$totalStores} stores");
    }

    /**
     * Get all menu buttons (main and subcategories) for store association.
     */
    private function getAllMenuButtons(): array
    {
        $menuButtons = [];
        
        // Get all main menu buttons
        $mainMenuButtons = MenuButton::whereNull('parent_id')->get();
        
        foreach ($mainMenuButtons as $mainButton) {
            $menuButtons[$mainButton->name] = $mainButton;
            
            // Get subcategories for this main button
            $subButtons = MenuButton::where('parent_id', $mainButton->id)->get();
            foreach ($subButtons as $subButton) {
                $menuButtons[$subButton->name] = $subButton;
            }
        }
        
        return $menuButtons;
    }

    /**
     * Create stores for each menu button using factory.
     */
    private function createStoresForMenuButtons(array $menuButtons): void
    {
        $totalStores = 0;
        
        foreach ($menuButtons as $menuButtonName => $menuButton) {
            $storeCount = $this->getStoreCountForMenuButton($menuButtonName);
            
            if ($storeCount > 0) {
                $this->createStoresForMenuButton($menuButtonName, $menuButton, $storeCount);
                $totalStores += $storeCount;
            }
        }

        $this->command->info("   🏪 Created {$totalStores} stores across all categories");
    }

    /**
     * Get store count for a specific menu button.
     */
    private function getStoreCountForMenuButton(string $menuButtonName): int
    {
        $storeCounts = $this->getStoreCounts();
        return $storeCounts[$menuButtonName] ?? 0;
    }

    /**
     * Create stores for a specific menu button using factory.
     */
    private function createStoresForMenuButton(string $menuButtonName, MenuButton $menuButton, int $count): void
    {
        // Create stores one by one to avoid static counter issues with count()
        for ($i = 0; $i < $count; $i++) {
            $factory = Store::factory()
                ->active()
                ->forMenuButton($menuButton);

            // Apply specific factory methods based on menu button type
            $factory = $this->applyFactoryMethod($factory, $menuButtonName);

            $factory->create();
        }

        $this->command->info("   📍 Created {$count} stores for {$menuButtonName}");
    }

    /**
     * Get store counts for each menu button.
     */
    private function getStoreCounts(): array
    {
        return [
            // Main categories - more stores for better pagination testing
            '🍽️ Food' => 2,
            '🛍️ Shopping' => 12,
            '🥳 Entertainment' => 8,
            '💆‍♀️ Beauty Salon' => 6,
            '🚗 Car Services' => 5,
            '🏨 Hotels' => 3,
            '💵 Currency Exchange' => 2,
            '🏡 Rental' => 4,
            '🏥 Hospitals' => 2,
            '📦 Express Delivery' => 3,

            // Food subcategories
            '🍔 Restaurant' => 2,
            '🍲 Hot Pot' => 2,
            '🍡 Barbecue' => 1,
            '🧋 Milk Tea' => 1,
            '🍩 Snacks' => 1,
            '🍜 Noodles' => 1,
            '🍉 Fruits' => 1,
            '🦀 Seafood' => 1,
            '🍲 Rice Noodles' => 1,

            // Shopping subcategories
            '🛒 Supermarket' => 4,
            '🧥 Clothing' => 6,
            '🎀 Accessories' => 5,
            '🚛 Proxy Shopping' => 3,
            '📱 Electronics' => 7,
            '💄 Cosmetics' => 4,
            '🧺 Laundry' => 3,
            '🏬 Local Shops' => 5,
            '🔞 Adult Products' => 2,

            // Entertainment subcategories
            '🕺🕺 Club' => 4,
            '🍺 Bar/KTV' => 6,
            '🧖‍♂️ Massage' => 3,
            '🧘‍♀️ Wellness' => 4,

            // Beauty Salon subcategories
            '💇‍♂️ Hair' => 5,
            '💅 Nails & Beauty' => 4,
            '💉 Medical Beauty' => 2,
            '🕸️ Tattoo' => 3,

            // Car Services subcategories
            '🛞 Car Repair' => 4,
            '🚙 Buy & Sell Cars' => 3,

            // Express Delivery subcategories
            '🎁 Asia Express' => 2,
            '🏃‍♂️ Errand Services' => 3,
        ];
    }

    /**
     * Apply specific factory method based on menu button type.
     */
    private function applyFactoryMethod($factory, string $menuButtonName)
    {
        // Food-related categories
        if (str_contains($menuButtonName, 'Food') || str_contains($menuButtonName, 'Restaurant') || 
            str_contains($menuButtonName, 'Hot Pot') || str_contains($menuButtonName, 'Barbecue') ||
            str_contains($menuButtonName, 'Milk Tea') || str_contains($menuButtonName, 'Snacks') ||
            str_contains($menuButtonName, 'Noodles') || str_contains($menuButtonName, 'Fruits') ||
            str_contains($menuButtonName, 'Seafood') || str_contains($menuButtonName, 'Rice Noodles')) {
            
            return $factory->foodStore();
        }

        // Shopping-related categories
        if (str_contains($menuButtonName, 'Shopping') || str_contains($menuButtonName, 'Supermarket') ||
            str_contains($menuButtonName, 'Clothing') || str_contains($menuButtonName, 'Accessories') ||
            str_contains($menuButtonName, 'Proxy Shopping') || str_contains($menuButtonName, 'Electronics') ||
            str_contains($menuButtonName, 'Cosmetics') || str_contains($menuButtonName, 'Laundry') ||
            str_contains($menuButtonName, 'Local Shops') || str_contains($menuButtonName, 'Adult Products')) {
            
            return $factory->shoppingStore();
        }

        // Service-related categories (Entertainment, Beauty, Car Services, etc.)
        if (str_contains($menuButtonName, 'Entertainment') || str_contains($menuButtonName, 'Club') ||
            str_contains($menuButtonName, 'Bar/KTV') || str_contains($menuButtonName, 'Massage') ||
            str_contains($menuButtonName, 'Wellness') || str_contains($menuButtonName, 'Beauty Salon') ||
            str_contains($menuButtonName, 'Hair') || str_contains($menuButtonName, 'Nails') ||
            str_contains($menuButtonName, 'Medical Beauty') || str_contains($menuButtonName, 'Tattoo') ||
            str_contains($menuButtonName, 'Car Services') || str_contains($menuButtonName, 'Car Repair') ||
            str_contains($menuButtonName, 'Buy & Sell Cars') || str_contains($menuButtonName, 'Hotels') ||
            str_contains($menuButtonName, 'Currency Exchange') || str_contains($menuButtonName, 'Rental') ||
            str_contains($menuButtonName, 'Hospitals') || str_contains($menuButtonName, 'Express Delivery') ||
            str_contains($menuButtonName, 'Asia Express') || str_contains($menuButtonName, 'Errand Services')) {
            
            return $factory->serviceStore();
        }

        // Default to general store
        return $factory;
    }

}
