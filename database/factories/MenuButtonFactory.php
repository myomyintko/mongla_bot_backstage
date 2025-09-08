<?php

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
     *
     * @var string
     */
    protected $model = MenuButton::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $buttonTypes = ['store', 'action'];
        $buttonNames = ['Main Menu', 'Sub Menu', 'Action Button', 'Navigation', 'Quick Access'];
        $templates = [
            'Welcome to our service! How can we help you today?',
            'Please select an option from the menu below.',
            'Choose your preferred service from the available options.',
            'Navigate through our services using the menu buttons.',
            'Access your account features using the menu below.'
        ];

        return [
            'name' => $this->faker->randomElement($buttonNames) . ' ' . $this->faker->word(),
            'button_type' => $this->faker->randomElement($buttonTypes),
            'sort' => $this->faker->numberBetween(0, 100),
            'status' => $this->faker->randomElement([0, 1]),
            'media_url' => $this->faker->optional(0.3)->imageUrl(64, 64, 'icons'),
            'enable_template' => $this->faker->boolean(30),
            'template_content' => $this->faker->optional(0.4)->randomElement($templates),
            'sub_btns' => $this->faker->optional(0.2)->randomElements([
                'Option 1',
                'Option 2',
                'Option 3',
                'Option 4'
            ], $this->faker->numberBetween(1, 3)),
        ];
    }

    /**
     * Indicate that the menu button is active.
     */
    public function active(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 1,
        ]);
    }

    /**
     * Indicate that the menu button is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 0,
        ]);
    }

    /**
     * Indicate that the menu button has a parent.
     */
    public function withParent(): static
    {
        return $this->state(fn(array $attributes) => [
            'parent_id' => MenuButton::factory(),
        ]);
    }

    /**
     * Indicate that the menu button is a root button (no parent).
     */
    public function root(): static
    {
        return $this->state(fn(array $attributes) => [
            'parent_id' => null,
        ]);
    }
}