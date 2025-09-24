<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = User::class;

    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = fake()->firstName();
        $lastName = fake()->lastName();
        $username = strtolower($firstName . '.' . $lastName . fake()->numberBetween(1, 999));

        return [
            'name' => $firstName . ' ' . $lastName,
            'email' => strtolower($firstName . '.' . $lastName . '@' . fake()->domainName()),
            'username' => $username,
            'avatar' => fake()->optional(0.3)->imageUrl(200, 200, 'people'),
            'email_verified_at' => fake()->optional(0.9)->dateTimeBetween('-1 year', 'now'),
            'status' => fake()->randomElement([User::STATUS_ACTIVE, User::STATUS_INACTIVE, User::STATUS_SUSPENDED]),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create an admin user.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Admin User',
            'email' => 'admin@monglabot.com',
            'username' => 'admin',
            'email_verified_at' => now(),
        ]);
    }

    /**
     * Create a super admin user.
     */
    public function superAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Super Admin',
            'email' => 'superadmin@monglabot.com',
            'username' => 'superadmin',
            'email_verified_at' => now(),
        ]);
    }

    /**
     * Create a user with avatar.
     */
    public function withAvatar(): static
    {
        return $this->state(fn (array $attributes) => [
            'avatar' => fake()->imageUrl(200, 200, 'people'),
        ]);
    }

    /**
     * Create a user without avatar.
     */
    public function withoutAvatar(): static
    {
        return $this->state(fn (array $attributes) => [
            'avatar' => null,
        ]);
    }

    /**
     * Create an active user.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => User::STATUS_ACTIVE,
        ]);
    }

    /**
     * Create an inactive user.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => User::STATUS_INACTIVE,
        ]);
    }

    /**
     * Create a suspended user.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => User::STATUS_SUSPENDED,
        ]);
    }
}
