<?php

namespace Database\Factories;

use App\Models\PinMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PinMessage>
 */
class PinMessageFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = PinMessage::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'media_url' => null,
            'status' => $this->faker->randomElement([0, 1]),
            'sort' => $this->faker->numberBetween(1, 100),
            'content' => $this->faker->optional(0.8)->paragraphs(2, true),
            'btn_name' => $this->faker->optional(0.5)->randomElement([
                'Learn More',
                'Get Started',
                'View Details',
                'Contact Us',
                'Shop Now',
                'Download',
                'Sign Up',
                'Read More',
            ]),
            'btn_link' => $this->faker->optional(0.5)->url(),
        ];
    }

    /**
     * Indicate that the pin message is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 1,
        ]);
    }

    /**
     * Indicate that the pin message is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 0,
        ]);
    }

    /**
     * Create a pin message with media (placeholder for future use).
     */
    public function withMedia(): static
    {
        return $this->state(fn (array $attributes) => [
            'media_url' => null, // Will be set when actual media is uploaded
        ]);
    }

    /**
     * Create a pin message without media.
     */
    public function withoutMedia(): static
    {
        return $this->state(fn (array $attributes) => [
            'media_url' => null,
        ]);
    }

    /**
     * Create a pin message with a call-to-action button.
     */
    public function withButton(): static
    {
        return $this->state(fn (array $attributes) => [
            'btn_name' => $this->faker->randomElement([
                'Learn More',
                'Get Started',
                'View Details',
                'Contact Us',
                'Shop Now',
                'Download',
                'Sign Up',
                'Read More',
            ]),
            'btn_link' => $this->faker->randomElement(['#', null]),
        ]);
    }

    /**
     * Create a pin message without a call-to-action button.
     */
    public function withoutButton(): static
    {
        return $this->state(fn (array $attributes) => [
            'btn_name' => null,
            'btn_link' => null,
        ]);
    }

    /**
     * Create a pin message with content.
     */
    public function withContent(): static
    {
        return $this->state(fn (array $attributes) => [
            'content' => $this->faker->paragraphs(2, true),
        ]);
    }

    /**
     * Create a pin message without content.
     */
    public function withoutContent(): static
    {
        return $this->state(fn (array $attributes) => [
            'content' => null,
        ]);
    }

    /**
     * Create a pin message with a specific sort order.
     */
    public function withSort(int $sort): static
    {
        return $this->state(fn (array $attributes) => [
            'sort' => $sort,
        ]);
    }

    /**
     * Create a promotional pin message.
     */
    public function promotional(): static
    {
        return $this->state(fn (array $attributes) => [
            'content' => $this->faker->randomElement([
                '🎉 Special Offer! Get 20% off on all items this week!',
                '🔥 Limited Time Deal - Don\'t miss out!',
                '✨ New arrivals are here! Check out our latest collection.',
                '💎 Premium quality products at unbeatable prices.',
                '🚀 Free shipping on orders over $50!',
            ]),
            'btn_name' => $this->faker->randomElement(['Shop Now', 'Get Offer', 'Learn More']),
            'btn_link' => $this->faker->randomElement(['#', null]),
            'media_url' => null, // Will be set when actual media is uploaded
        ]);
    }

    /**
     * Create an informational pin message.
     */
    public function informational(): static
    {
        return $this->state(fn (array $attributes) => [
            'content' => $this->faker->randomElement([
                '📢 Important announcement: We\'re updating our services.',
                'ℹ️ New features are now available in our app.',
                '📋 Please read our updated terms and conditions.',
                '🔔 Stay tuned for exciting updates coming soon!',
                '📞 Need help? Contact our support team anytime.',
            ]),
            'btn_name' => $this->faker->randomElement(['Read More', 'Learn More', 'Contact Us']),
            'btn_link' => $this->faker->randomElement(['#', null]),
        ]);
    }
}