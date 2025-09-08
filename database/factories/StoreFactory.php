<?php

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
     *
     * @var string
     */
    protected $model = Store::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $storeTypes = [
            'Restaurant', 'Cafe', 'Shop', 'Market', 'Service Center',
            'Clinic', 'Hotel', 'Bar', 'Gym', 'Salon', 'Pharmacy'
        ];

        $storeType = fake()->randomElement($storeTypes);
        $name = fake()->company() . ' ' . $storeType;

        return [
            'name' => $name,
            'description' => fake()->paragraph(3),
            'media_url' => null,
            'open_hour' => fake()->time('H:i'),
            'close_hour' => fake()->time('H:i'),
            'status' => fake()->randomElement([0, 1]),
            'address' => fake()->address(),
            'recommand' => fake()->boolean(30), // 30% chance of being recommended
            'sub_btns' => null,
            'menu_button_id' => MenuButton::factory(),
        ];
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
     * Create a store without a menu button.
     */
    public function withoutMenuButton(): static
    {
        return $this->state(fn (array $attributes) => [
            'menu_button_id' => null,
        ]);
    }
}
