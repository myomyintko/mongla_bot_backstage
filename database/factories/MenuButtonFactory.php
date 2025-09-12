<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\MenuButton;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MenuButton>
 */
class MenuButtonFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = MenuButton::class;

    /**
     * Menu button templates with realistic content.
     */
    private static array $menuButtonTemplates = [
        'food' => [
            'emojis' => ['🍽️', '🍔', '🍲', '🍜', '🧋', '🍕', '🍱', '🥘', '🍛', '🍳'],
            'labels' => ['Food', 'Restaurant', 'Cafe', 'Dining', 'Kitchen', 'Eatery', 'Bistro'],
            'descriptions' => [
                'Discover amazing food options',
                'Taste the best local cuisine',
                'Fresh ingredients, great flavors',
                'Authentic recipes and modern dishes',
            ],
        ],
        'shopping' => [
            'emojis' => ['🛍️', '🛒', '🏪', '💄', '📱', '👕', '👗', '👠', '🛍️', '🛒'],
            'labels' => ['Shopping', 'Store', 'Shop', 'Market', 'Boutique', 'Mall', 'Outlet'],
            'descriptions' => [
                'Find everything you need',
                'Quality products at great prices',
                'Latest trends and styles',
                'One-stop shopping destination',
            ],
        ],
        'services' => [
            'emojis' => ['🔧', '💇‍♂️', '🚗', '🏥', '💆‍♀️', '🧹', '📦', '🏠', '🔨', '⚡'],
            'labels' => ['Services', 'Service', 'Center', 'Clinic', 'Salon', 'Studio', 'Agency'],
            'descriptions' => [
                'Professional service with expertise',
                'Quality care and attention to detail',
                'Reliable and efficient solutions',
                'Customer-focused approach',
            ],
        ],
        'entertainment' => [
            'emojis' => ['🥳', '🎭', '🎪', '🎨', '🎵', '🎬', '🎮', '🎯', '🎲', '🎊'],
            'labels' => ['Entertainment', 'Fun', 'Leisure', 'Recreation', 'Activities', 'Events'],
            'descriptions' => [
                'Fun and exciting experiences',
                'Entertainment for everyone',
                'Create lasting memories',
                'Enjoy your free time',
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
        $template = fake()->randomElement(array_keys(self::$menuButtonTemplates));
        $templateData = self::$menuButtonTemplates[$template];
        
        $emoji = fake()->randomElement($templateData['emojis']);
        $label = fake()->randomElement($templateData['labels']);
        $description = fake()->randomElement($templateData['descriptions']);

        // Generate unique names to avoid conflicts with predefined menu buttons
        $uniqueSuffix = fake()->unique()->numberBetween(1000, 9999);
        $name = $emoji . ' ' . $label . ' ' . $uniqueSuffix;

        return [
            'parent_id' => null,
            'name' => $name,
            'button_type' => fake()->randomElement(['store', 'link', 'text']),
            'sort' => fake()->numberBetween(100, 999), // Use higher sort numbers to avoid conflicts
            'status' => fake()->randomElement([0, 1]),
            'media_url' => null,
            'enable_template' => fake()->boolean(30),
            'template_content' => $description,
            'sub_btns' => null,
        ];
    }

    /**
     * Indicate that the menu button is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 1,
        ]);
    }

    /**
     * Indicate that the menu button is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 0,
        ]);
    }

    /**
     * Create a root menu button (no parent).
     */
    public function root(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => null,
            'button_type' => 'store',
        ]);
    }

    /**
     * Create a child menu button.
     */
    public function child(MenuButton $parent): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => $parent->id,
            'button_type' => 'store',
            'sort' => fake()->numberBetween(100, 999), // Use higher sort numbers to avoid conflicts
        ]);
    }

    /**
     * Create a child menu button for a random parent.
     */
    public function childOfRandomParent(): static
    {
        $parent = MenuButton::whereNull('parent_id')->inRandomOrder()->first();
        
        if (!$parent) {
            return $this->root(); // Fallback to root if no parents exist
        }

        return $this->child($parent);
    }

    /**
     * Create a food menu button.
     */
    public function food(): static
    {
        $templateData = self::$menuButtonTemplates['food'];
        $emoji = fake()->randomElement($templateData['emojis']);
        $label = fake()->randomElement($templateData['labels']);
        
        return $this->state(fn (array $attributes) => [
            'name' => $emoji . ' ' . $label,
            'button_type' => 'store',
            'template_content' => fake()->randomElement($templateData['descriptions']),
        ]);
    }

    /**
     * Create a shopping menu button.
     */
    public function shopping(): static
    {
        $templateData = self::$menuButtonTemplates['shopping'];
        $emoji = fake()->randomElement($templateData['emojis']);
        $label = fake()->randomElement($templateData['labels']);
        
        return $this->state(fn (array $attributes) => [
            'name' => $emoji . ' ' . $label,
            'button_type' => 'store',
            'template_content' => fake()->randomElement($templateData['descriptions']),
        ]);
    }

    /**
     * Create a services menu button.
     */
    public function services(): static
    {
        $templateData = self::$menuButtonTemplates['services'];
        $emoji = fake()->randomElement($templateData['emojis']);
        $label = fake()->randomElement($templateData['labels']);
        
        return $this->state(fn (array $attributes) => [
            'name' => $emoji . ' ' . $label,
            'button_type' => 'store',
            'template_content' => fake()->randomElement($templateData['descriptions']),
        ]);
    }

    /**
     * Create an entertainment menu button.
     */
    public function entertainment(): static
    {
        $templateData = self::$menuButtonTemplates['entertainment'];
        $emoji = fake()->randomElement($templateData['emojis']);
        $label = fake()->randomElement($templateData['labels']);
        
        return $this->state(fn (array $attributes) => [
            'name' => $emoji . ' ' . $label,
            'button_type' => 'store',
            'template_content' => fake()->randomElement($templateData['descriptions']),
        ]);
    }

    /**
     * Create a menu button with template enabled.
     */
    public function withTemplate(): static
    {
        return $this->state(fn (array $attributes) => [
            'enable_template' => true,
            'template_content' => fake()->sentence(),
        ]);
    }

    /**
     * Create a menu button without template.
     */
    public function withoutTemplate(): static
    {
        return $this->state(fn (array $attributes) => [
            'enable_template' => false,
            'template_content' => null,
        ]);
    }

    /**
     * Create a menu button with media.
     */
    public function withMedia(): static
    {
        return $this->state(fn (array $attributes) => [
            'media_url' => fake()->imageUrl(400, 300, 'abstract'),
        ]);
    }

    /**
     * Create a menu button without media.
     */
    public function withoutMedia(): static
    {
        return $this->state(fn (array $attributes) => [
            'media_url' => null,
        ]);
    }

    /**
     * Create a menu button with sub buttons.
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
     * Create a menu button without sub buttons.
     */
    public function withoutSubButtons(): static
    {
        return $this->state(fn (array $attributes) => [
            'sub_btns' => null,
        ]);
    }

    /**
     * Create a menu button with a specific sort order.
     */
    public function withSort(int $sort): static
    {
        return $this->state(fn (array $attributes) => [
            'sort' => $sort,
        ]);
    }

    /**
     * Create a high-priority menu button (low sort number).
     */
    public function highPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'sort' => fake()->numberBetween(1, 10),
            'status' => 1,
        ]);
    }

    /**
     * Create a low-priority menu button (high sort number).
     */
    public function lowPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'sort' => fake()->numberBetween(50, 100),
        ]);
    }
}
