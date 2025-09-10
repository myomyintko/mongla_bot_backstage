<?php

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
     *
     * @var string
     */
    protected $model = Advertisement::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('-1 month', '+1 month');
        $endDate = $this->faker->dateTimeBetween($startDate, '+2 months');

        return [
            'store_id' => Store::factory(),
            'title' => $this->faker->sentence(3),
            'status' => $this->faker->randomElement([0, 1]),
            'description' => $this->faker->paragraph(3),
            'media_url' => null,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'frequency_cap_minutes' => $this->faker->optional(0.6)->randomElement([15, 30, 60, 120, 240, 480]),
        ];
    }

    /**
     * Indicate that the advertisement is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 1,
            'start_date' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'end_date' => $this->faker->dateTimeBetween('now', '+1 month'),
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
            'start_date' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'end_date' => $this->faker->dateTimeBetween('now', '+2 weeks'),
        ]);
    }

    /**
     * Indicate that the advertisement is scheduled for the future.
     */
    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 1,
            'start_date' => $this->faker->dateTimeBetween('+1 day', '+1 month'),
            'end_date' => $this->faker->dateTimeBetween('+1 month', '+2 months'),
        ]);
    }

    /**
     * Indicate that the advertisement has ended.
     */
    public function ended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 1,
            'start_date' => $this->faker->dateTimeBetween('-2 months', '-1 month'),
            'end_date' => $this->faker->dateTimeBetween('-1 month', '-1 week'),
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
}