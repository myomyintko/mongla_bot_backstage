<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Advertisement;
use App\Models\Store;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Advertisement>
 */
class AdvertisementFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = Advertisement::class;

    /**
     * Advertisement templates with realistic content.
     */
    private static array $advertisementTemplates = [
        'promotional' => [
            'titles' => [
                'Special Offer - Limited Time!',
                'Exclusive Deal - Don\'t Miss Out!',
                'Flash Sale - Up to 50% Off!',
                'New Arrivals - Fresh & Exciting!',
                'Weekend Special - Great Savings!',
                'Holiday Promotion - Celebrate with Us!',
            ],
            'descriptions' => [
                'Discover amazing deals and exclusive offers. Limited time only!',
                'Experience premium quality at unbeatable prices. Shop now!',
                'Transform your space with our latest collection. Order today!',
                'Join thousands of satisfied customers. Get started now!',
                'Professional service with exceptional results. Book today!',
            ],
        ],
        'informational' => [
            'titles' => [
                'Important Update - Please Read',
                'New Service Available',
                'Holiday Hours Notice',
                'System Maintenance Alert',
                'Feature Announcement',
                'Policy Update',
            ],
            'descriptions' => [
                'We\'re excited to announce new features and improvements.',
                'Please note our updated operating hours and policies.',
                'Stay informed about the latest updates and changes.',
                'We appreciate your patience during our improvements.',
                'Thank you for your continued support and loyalty.',
            ],
        ],
        'seasonal' => [
            'titles' => [
                'Spring Collection - Fresh & New',
                'Summer Specials - Beat the Heat',
                'Autumn Harvest - Rich & Warm',
                'Winter Wonderland - Cozy & Comfortable',
                'Holiday Season - Joy & Celebration',
                'New Year - Fresh Start',
            ],
            'descriptions' => [
                'Embrace the season with our curated collection.',
                'Perfect for the current weather and your lifestyle.',
                'Seasonal favorites that never go out of style.',
                'Celebrate the moment with our special offerings.',
                'Make memories with our seasonal selections.',
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
        $template = fake()->randomElement(array_keys(self::$advertisementTemplates));
        $templateData = self::$advertisementTemplates[$template];
        
        $title = fake()->randomElement($templateData['titles']);
        $description = fake()->randomElement($templateData['descriptions']);

        $startDate = fake()->dateTimeBetween('-1 month', '+1 month');
        $endDate = fake()->dateTimeBetween($startDate, '+2 months');

        return [
            'store_id' => Store::factory(),
            'title' => $title,
            'status' => fake()->randomElement([0, 1]),
            'description' => $description . ' ' . fake()->paragraph(2),
            'media_url' => null,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'frequency_cap_minutes' => fake()->randomElement([1,3,15, 30, 60, 120, 240, 480, 720, 1440]),
        ];
    }

    /**
     * Indicate that the advertisement is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 1,
            'start_date' => fake()->dateTimeBetween('-1 week', 'now'),
            'end_date' => fake()->dateTimeBetween('now', '+1 month'),
        ]);
    }

    /**
     * Indicate that the advertisement is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 0,
        ]);
    }

    /**
     * Indicate that the advertisement is currently running.
     */
    public function running(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 1,
            'start_date' => fake()->dateTimeBetween('-1 week', 'now'),
            'end_date' => fake()->dateTimeBetween('now', '+2 weeks'),
        ]);
    }

    /**
     * Indicate that the advertisement is scheduled for the future.
     */
    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 1,
            'start_date' => fake()->dateTimeBetween('+1 day', '+1 month'),
            'end_date' => fake()->dateTimeBetween('+1 month', '+2 months'),
        ]);
    }

    /**
     * Indicate that the advertisement has ended.
     */
    public function ended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 1,
            'start_date' => fake()->dateTimeBetween('-2 months', '-1 month'),
            'end_date' => fake()->dateTimeBetween('-1 month', '-1 week'),
        ]);
    }

    /**
     * Create a promotional advertisement.
     */
    public function promotional(): static
    {
        $templateData = self::$advertisementTemplates['promotional'];
        
        return $this->state(fn (array $attributes) => [
            'title' => fake()->randomElement($templateData['titles']),
            'description' => fake()->randomElement($templateData['descriptions']) . ' ' . fake()->paragraph(2),
            'status' => 1,
        ]);
    }

    /**
     * Create an informational advertisement.
     */
    public function informational(): static
    {
        $templateData = self::$advertisementTemplates['informational'];
        
        return $this->state(fn (array $attributes) => [
            'title' => fake()->randomElement($templateData['titles']),
            'description' => fake()->randomElement($templateData['descriptions']) . ' ' . fake()->paragraph(2),
            'status' => 1,
        ]);
    }

    /**
     * Create a seasonal advertisement.
     */
    public function seasonal(): static
    {
        $templateData = self::$advertisementTemplates['seasonal'];
        
        return $this->state(fn (array $attributes) => [
            'title' => fake()->randomElement($templateData['titles']),
            'description' => fake()->randomElement($templateData['descriptions']) . ' ' . fake()->paragraph(2),
            'status' => 1,
        ]);
    }

    /**
     * Create an advertisement with media.
     */
    public function withMedia(): static
    {
        return $this->state(fn (array $attributes) => [
            'media_url' => fake()->imageUrl(1200, 800, 'business'),
        ]);
    }

    /**
     * Create an advertisement without media.
     */
    public function withoutMedia(): static
    {
        return $this->state(fn (array $attributes) => [
            'media_url' => null,
        ]);
    }

    /**
     * Create an advertisement with frequency cap.
     */
    public function withFrequencyCap(): static
    {
        return $this->state(fn (array $attributes) => [
            'frequency_cap_minutes' => fake()->randomElement([15, 30, 60, 120, 240, 480, 720, 1440]),
        ]);
    }

    /**
     * Create an advertisement without frequency cap.
     */
    public function withoutFrequencyCap(): static
    {
        return $this->state(fn (array $attributes) => [
            'frequency_cap_minutes' => null,
        ]);
    }

    /**
     * Create an advertisement without a store.
     */
    public function withoutStore(): static
    {
        return $this->state(fn (array $attributes) => [
            'store_id' => null,
        ]);
    }

    /**
     * Create an advertisement with a specific store.
     */
    public function forStore(Store $store): static
    {
        return $this->state(fn (array $attributes) => [
            'store_id' => $store->id,
        ]);
    }

    /**
     * Create a short-term advertisement (1-7 days).
     */
    public function shortTerm(): static
    {
        $startDate = fake()->dateTimeBetween('-3 days', '+1 day');
        $endDate = fake()->dateTimeBetween($startDate, '+7 days');
        
        return $this->state(fn (array $attributes) => [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => 1,
        ]);
    }

    /**
     * Create a long-term advertisement (1-6 months).
     */
    public function longTerm(): static
    {
        $startDate = fake()->dateTimeBetween('-1 month', '+1 month');
        $endDate = fake()->dateTimeBetween($startDate, '+6 months');
        
        return $this->state(fn (array $attributes) => [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => 1,
        ]);
    }
}