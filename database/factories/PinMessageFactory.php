<?php

declare(strict_types=1);

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
     */
    protected $model = PinMessage::class;

    /**
     * Pin message templates with realistic content.
     */
    private static array $pinMessageTemplates = [
        'promotional' => [
            'content' => [
                '🎉 Special Offer! Get 20% off on all items this week!',
                '🔥 Limited Time Deal - Don\'t miss out!',
                '✨ New arrivals are here! Check out our latest collection.',
                '💎 Premium quality products at unbeatable prices.',
                '🚀 Free shipping on orders over $50!',
                '🎁 Buy 2 Get 1 Free - Limited time only!',
                '⭐ Customer favorite - Now on sale!',
                '🏆 Award-winning service at your doorstep!',
            ],
            'buttons' => [
                'Shop Now', 'Get Offer', 'Learn More', 'Buy Now', 'View Sale', 'Get Deal'
            ],
        ],
        'informational' => [
            'content' => [
                '📢 Important announcement: We\'re updating our services.',
                'ℹ️ New features are now available in our app.',
                '📋 Please read our updated terms and conditions.',
                '🔔 Stay tuned for exciting updates coming soon!',
                '📞 Need help? Contact our support team anytime.',
                '🕒 New operating hours starting next week.',
                '🔧 System maintenance scheduled for tonight.',
                '📱 Download our mobile app for better experience.',
            ],
            'buttons' => [
                'Read More', 'Learn More', 'Contact Us', 'Download', 'View Details', 'Get Started'
            ],
        ],
        'seasonal' => [
            'content' => [
                '🌸 Spring Collection - Fresh & New!',
                '☀️ Summer Specials - Beat the Heat!',
                '🍂 Autumn Harvest - Rich & Warm!',
                '❄️ Winter Wonderland - Cozy & Comfortable!',
                '🎄 Holiday Season - Joy & Celebration!',
                '🎊 New Year - Fresh Start!',
                '💝 Valentine\'s Day Specials!',
                '🎃 Halloween Treats - Spooky Good!',
            ],
            'buttons' => [
                'Shop Collection', 'View Specials', 'Celebrate', 'Get Started', 'Explore', 'Join Us'
            ],
        ],
        'welcome' => [
            'content' => [
                '👋 Welcome to our community!',
                '🌟 Thank you for joining us!',
                '🎯 Discover amazing features and services.',
                '💫 Your journey starts here!',
                '🚀 Ready to explore? Let\'s get started!',
                '🎪 Fun and exciting experiences await!',
                '🌈 Discover a world of possibilities!',
                '🎭 Entertainment and services at your fingertips!',
            ],
            'buttons' => [
                'Get Started', 'Explore', 'Learn More', 'Join Now', 'Begin', 'Discover'
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
        $template = fake()->randomElement(array_keys(self::$pinMessageTemplates));
        $templateData = self::$pinMessageTemplates[$template];
        
        $content = fake()->randomElement($templateData['content']);
        $buttonName = fake()->optional(0.6)->randomElement($templateData['buttons']);

        return [
            'media_url' => null,
            'status' => fake()->randomElement([0, 1]),
            'sort' => fake()->numberBetween(1, 100),
            'content' => $content,
            'btn_name' => $buttonName,
            'btn_link' => $buttonName ? fake()->randomElement(['#', fake()->url()]) : null,
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
     * Create a promotional pin message.
     */
    public function promotional(): static
    {
        $templateData = self::$pinMessageTemplates['promotional'];
        
        return $this->state(fn (array $attributes) => [
            'content' => fake()->randomElement($templateData['content']),
            'btn_name' => fake()->randomElement($templateData['buttons']),
            'btn_link' => fake()->randomElement(['#', fake()->url()]),
            'status' => 1,
        ]);
    }

    /**
     * Create an informational pin message.
     */
    public function informational(): static
    {
        $templateData = self::$pinMessageTemplates['informational'];
        
        return $this->state(fn (array $attributes) => [
            'content' => fake()->randomElement($templateData['content']),
            'btn_name' => fake()->randomElement($templateData['buttons']),
            'btn_link' => fake()->randomElement(['#', fake()->url()]),
            'status' => 1,
        ]);
    }

    /**
     * Create a seasonal pin message.
     */
    public function seasonal(): static
    {
        $templateData = self::$pinMessageTemplates['seasonal'];
        
        return $this->state(fn (array $attributes) => [
            'content' => fake()->randomElement($templateData['content']),
            'btn_name' => fake()->randomElement($templateData['buttons']),
            'btn_link' => fake()->randomElement(['#', fake()->url()]),
            'status' => 1,
        ]);
    }

    /**
     * Create a welcome pin message.
     */
    public function welcome(): static
    {
        $templateData = self::$pinMessageTemplates['welcome'];
        
        return $this->state(fn (array $attributes) => [
            'content' => fake()->randomElement($templateData['content']),
            'btn_name' => fake()->randomElement($templateData['buttons']),
            'btn_link' => fake()->randomElement(['#', fake()->url()]),
            'status' => 1,
        ]);
    }

    /**
     * Create a pin message with media.
     */
    public function withMedia(): static
    {
        return $this->state(fn (array $attributes) => [
            'media_url' => fake()->imageUrl(800, 600, 'abstract'),
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
            'btn_name' => fake()->randomElement([
                'Learn More', 'Get Started', 'View Details', 'Contact Us',
                'Shop Now', 'Download', 'Sign Up', 'Read More', 'Explore', 'Join Now'
            ]),
            'btn_link' => fake()->randomElement(['#', fake()->url()]),
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
            'content' => fake()->randomElement([
                '🎉 Exciting news! New features are now available.',
                '📢 Important update: Please read our latest announcement.',
                '🌟 Discover amazing opportunities waiting for you.',
                '💫 Your experience just got better with our latest updates.',
                '🚀 Ready to take the next step? Let\'s explore together!',
            ]),
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
     * Create a high-priority pin message (low sort number).
     */
    public function highPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'sort' => fake()->numberBetween(1, 10),
            'status' => 1,
        ]);
    }

    /**
     * Create a low-priority pin message (high sort number).
     */
    public function lowPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'sort' => fake()->numberBetween(50, 100),
        ]);
    }

    /**
     * Create a pin message with external link.
     */
    public function withExternalLink(): static
    {
        return $this->state(fn (array $attributes) => [
            'btn_link' => fake()->url(),
        ]);
    }

    /**
     * Create a pin message with internal link.
     */
    public function withInternalLink(): static
    {
        return $this->state(fn (array $attributes) => [
            'btn_link' => fake()->randomElement(['#', '/dashboard', '/profile', '/settings']),
        ]);
    }
}