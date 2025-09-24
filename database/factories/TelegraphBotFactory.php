<?php

declare(strict_types=1);

namespace Database\Factories;

use DefStudio\Telegraph\Models\TelegraphBot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\DefStudio\Telegraph\Models\TelegraphBot>
 */
class TelegraphBotFactory extends Factory
{
    protected $model = TelegraphBot::class;

    public function definition(): array
    {
        return [
            'token' => $this->faker->numerify('##########:') . $this->faker->regexify('[A-Za-z0-9_-]{35}'),
            'name' => $this->faker->words(2, true) . ' Bot',
        ];
    }
}
