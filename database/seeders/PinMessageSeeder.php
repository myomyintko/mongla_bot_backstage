<?php

namespace Database\Seeders;

use App\Models\PinMessage;
use Illuminate\Database\Seeder;

class PinMessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "Seeding pin messages...\n";

        // Create some active promotional pin messages
        PinMessage::factory()
            ->count(3)
            ->active()
            ->promotional()
            ->create();

        // Create some active informational pin messages
        PinMessage::factory()
            ->count(2)
            ->active()
            ->informational()
            ->create();

        // Create some pin messages with media
        PinMessage::factory()
            ->count(4)
            ->active()
            ->withMedia()
            ->withButton()
            ->create();

        // Create some pin messages without media
        PinMessage::factory()
            ->count(2)
            ->active()
            ->withoutMedia()
            ->withContent()
            ->create();

        // Create some inactive pin messages
        PinMessage::factory()
            ->count(2)
            ->inactive()
            ->create();

        // Create some pin messages with specific sort orders
        PinMessage::factory()
            ->count(3)
            ->active()
            ->withSort(1)
            ->withButton()
            ->create();

        PinMessage::factory()
            ->count(2)
            ->active()
            ->withSort(2)
            ->withMedia()
            ->create();

        $totalPinMessages = PinMessage::count();
        echo "✅ Pin messages seeded successfully! Created {$totalPinMessages} pin messages.\n";
    }
}