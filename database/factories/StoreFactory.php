<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Store;
use App\Models\MenuButton;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Store>
 */
class StoreFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = Store::class;

    /**
     * Static counter to ensure unique names.
     */
    private static int $nameCounter = 0;
    
    /**
     * Tracks used names to prevent duplicates.
     */
    private static array $usedNames = [];

    /**
     * Reset the name counter and used names.
     */
    public static function resetNameCounter(): void
    {
        self::$nameCounter = 0;
        self::$usedNames = [];
    }

    /**
     * Store categories with emojis and descriptions.
     */
    private static array $storeCategories = [
        'food' => [
            'emojis' => ['🍔', '🍲', '🍜', '🧋', '🍕', '🍱', '🥘', '🍛'],
            'types' => ['Restaurant', 'Cafe', 'Bistro', 'Diner', 'Eatery', 'Kitchen'],
            'descriptions' => [
                'Authentic cuisine with fresh ingredients',
                'Cozy atmosphere with delicious food',
                'Traditional recipes with modern twist',
                'Premium dining experience',
                'Local flavors and international dishes',
            ],
        ],
        'shopping' => [
            'emojis' => ['🛒', '🏪', '🛍️', '💄', '📱', '👕', '👗', '👠'],
            'types' => ['Store', 'Shop', 'Boutique', 'Market', 'Mall', 'Outlet'],
            'descriptions' => [
                'Quality products at great prices',
                'Latest trends and styles',
                'Premium brands and selections',
                'One-stop shopping destination',
                'Exclusive collections and deals',
            ],
        ],
        'services' => [
            'emojis' => ['🔧', '💇‍♂️', '🚗', '🏥', '💆‍♀️', '🧹', '📦', '🏠'],
            'types' => ['Center', 'Service', 'Clinic', 'Salon', 'Studio', 'Agency'],
            'descriptions' => [
                'Professional service with expertise',
                'Quality care and attention to detail',
                'Reliable and efficient solutions',
                'Customer-focused approach',
                'Modern facilities and equipment',
            ],
        ],
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $category = fake()->randomElement(array_keys(self::$storeCategories));
        $categoryData = self::$storeCategories[$category];
        
        $emoji = fake()->randomElement($categoryData['emojis']);
        $type = fake()->randomElement($categoryData['types']);
        $description = fake()->randomElement($categoryData['descriptions']);
        
        $storeName = $this->generateUniqueStoreName($emoji, $type);

        // Generate realistic operating hours
        $openHour = fake()->time('H:i');
        $closeHour = fake()->time('H:i');

        return [
            'name' => $storeName,
            'description' => $description . '. ' . fake()->paragraph(2),
            'media_url' => null, // No media by default
            'menu_urls' => null, // No menu URLs by default
            'open_hour' => $openHour,
            'close_hour' => $closeHour,
            'status' => 1, // Active by default
            'address' => fake()->streetAddress() . ', ' . fake()->city() . ', ' . fake()->state(),
            'recommand' => fake()->boolean(25), // 25% chance of being recommended
            'sub_btns' => null, // No sub buttons by default
            'menu_button_id' => null, // Will be set by seeder
        ];
    }

    /**
     * Generate a unique store name.
     */
    private function generateUniqueStoreName(string $emoji, string $type): string
    {
        do {
            // Increment counter for guaranteed uniqueness
            self::$nameCounter++;
            
            // Generate a unique company name using counter and random elements
            $companyWords = ['Inc', 'LLC', 'Corp', 'Group', 'Associates', 'Partners', 'Company', 'Enterprises'];
            $adjectives = ['Global', 'Premium', 'Elite', 'Royal', 'Golden', 'Supreme', 'Best', 'Quality'];
            
            $companyName = fake()->lastName() . ' ' . fake()->randomElement($companyWords);
            if (self::$nameCounter % 3 === 0) {
                $companyName = fake()->randomElement($adjectives) . ' ' . $companyName;
            }
            
            $uniqueId = self::$nameCounter;
            $baseName = $emoji . ' ' . $companyName . ' ' . $type;
            $storeName = $baseName . ' #' . $uniqueId;
            
        } while (in_array($storeName, self::$usedNames));
        
        // Track this name as used
        self::$usedNames[] = $storeName;
        
        return $storeName;
    }

    /**
     * Indicate that the store is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 1,
        ]);
    }

    /**
     * Indicate that the store is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 0,
        ]);
    }

    /**
     * Indicate that the store is recommended.
     */
    public function recommended(): static
    {
        return $this->state(fn (array $attributes) => [
            'recommand' => true,
        ]);
    }

    /**
     * Indicate that the store is not recommended.
     */
    public function notRecommended(): static
    {
        return $this->state(fn (array $attributes) => [
            'recommand' => false,
        ]);
    }

    /**
     * Create a food store.
     */
    public function food(): static
    {
        return $this->state(function (array $attributes) {
            $categoryData = self::$storeCategories['food'];
            $emoji = fake()->randomElement($categoryData['emojis']);
            $type = fake()->randomElement($categoryData['types']);
            $description = fake()->randomElement($categoryData['descriptions']);
            
            $storeName = $this->generateUniqueStoreName($emoji, $type);
            
            return [
                'name' => $storeName,
                'description' => $description . '. ' . fake()->paragraph(2),
                'open_hour' => fake()->time('H:i'),
                'close_hour' => fake()->time('H:i'),
            ];
        });
    }

    /**
     * Create a shopping store.
     */
    public function shopping(): static
    {
        return $this->state(function (array $attributes) {
            $categoryData = self::$storeCategories['shopping'];
            $emoji = fake()->randomElement($categoryData['emojis']);
            $type = fake()->randomElement($categoryData['types']);
            $description = fake()->randomElement($categoryData['descriptions']);
            
            $storeName = $this->generateUniqueStoreName($emoji, $type);
            
            return [
                'name' => $storeName,
                'description' => $description . '. ' . fake()->paragraph(2),
                'open_hour' => fake()->time('H:i'),
                'close_hour' => fake()->time('H:i'),
            ];
        });
    }

    /**
     * Create a service store.
     */
    public function service(): static
    {
        return $this->state(function (array $attributes) {
            $categoryData = self::$storeCategories['services'];
            $emoji = fake()->randomElement($categoryData['emojis']);
            $type = fake()->randomElement($categoryData['types']);
            $description = fake()->randomElement($categoryData['descriptions']);
            
            $storeName = $this->generateUniqueStoreName($emoji, $type);
            
            return [
                'name' => $storeName,
                'description' => $description . '. ' . fake()->paragraph(2),
                'open_hour' => fake()->time('H:i'),
                'close_hour' => fake()->time('H:i'),
            ];
        });
    }

    /**
     * Create a store with media.
     */
    public function withMedia(): static
    {
        return $this->state(fn (array $attributes) => [
            'media_url' => fake()->imageUrl(800, 600, 'business'),
        ]);
    }

    /**
     * Create a store without media.
     */
    public function withoutMedia(): static
    {
        return $this->state(fn (array $attributes) => [
            'media_url' => null,
        ]);
    }

    /**
     * Create a store with menu URLs.
     */
    public function withMenuUrls(): static
    {
        return $this->state(fn (array $attributes) => [
            'menu_urls' => fake()->randomElements([
                'https://example.com/menu1.pdf',
                'https://example.com/menu2.jpg',
                'https://example.com/menu3.png',
            ], fake()->numberBetween(1, 3)),
        ]);
    }

    /**
     * Create a store without menu URLs.
     */
    public function withoutMenuUrls(): static
    {
        return $this->state(fn (array $attributes) => [
            'menu_urls' => null,
        ]);
    }

    /**
     * Create a store with sub buttons.
     */
    public function withSubButtons(): static
    {
        return $this->state(fn (array $attributes) => [
            'sub_btns' => fake()->randomElements([
                'Order Online', 'Book Table', 'Call Now', 'Get Directions', 
                'View Menu', 'Make Appointment', 'Get Quote', 'Contact Us'
            ], fake()->numberBetween(1, 4)),
        ]);
    }

    /**
     * Create a store without sub buttons.
     */
    public function withoutSubButtons(): static
    {
        return $this->state(fn (array $attributes) => [
            'sub_btns' => null,
        ]);
    }

    /**
     * Create a store for a specific menu button.
     */
    public function forMenuButton(MenuButton $menuButton): static
    {
        return $this->state(fn (array $attributes) => [
            'menu_button_id' => $menuButton->id,
        ]);
    }

    /**
     * Create a store without a menu button.
     */
    public function withoutMenuButton(): static
    {
        return $this->state(fn (array $attributes) => [
            'menu_button_id' => null,
        ]);
    }

    /**
     * Create a store for a specific category with custom emoji and type.
     */
    public function forCategory(string $category, string $emoji, string $type): static
    {
        $categoryData = self::$storeCategories[$category] ?? self::$storeCategories['food'];
        $description = fake()->randomElement($categoryData['descriptions']);
        
        $storeName = $this->generateUniqueStoreName($emoji, $type);

        return $this->state(fn (array $attributes) => [
            'name' => $storeName,
            'description' => $description . '. ' . fake()->paragraph(2),
            // Preserve menu_button_id if it was already set
            'menu_button_id' => $attributes['menu_button_id'] ?? null,
        ]);
    }

    /**
     * Create a food store with specific type.
     */
    public function foodStore(string $emoji = null, string $type = null): static
    {
        $emoji = $emoji ?? fake()->randomElement(self::$storeCategories['food']['emojis']);
        $type = $type ?? fake()->randomElement(self::$storeCategories['food']['types']);
        
        return $this->forCategory('food', $emoji, $type);
    }

    /**
     * Create a shopping store with specific type.
     */
    public function shoppingStore(string $emoji = null, string $type = null): static
    {
        $emoji = $emoji ?? fake()->randomElement(self::$storeCategories['shopping']['emojis']);
        $type = $type ?? fake()->randomElement(self::$storeCategories['shopping']['types']);
        
        return $this->forCategory('shopping', $emoji, $type);
    }

    /**
     * Create a service store with specific type.
     */
    public function serviceStore(string $emoji = null, string $type = null): static
    {
        $emoji = $emoji ?? fake()->randomElement(self::$storeCategories['services']['emojis']);
        $type = $type ?? fake()->randomElement(self::$storeCategories['services']['types']);
        
        return $this->forCategory('services', $emoji, $type);
    }
}
