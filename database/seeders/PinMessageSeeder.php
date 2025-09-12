<?php

declare(strict_types=1);

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
        $this->command->info('🌱 Seeding pin messages...');

        // Create different types of pin messages
        $this->createPromotionalMessages();
        $this->createInformationalMessages();
        $this->createSeasonalMessages();
        $this->createWelcomeMessages();
        $this->createMediaMessages();
        $this->createPriorityMessages();

        $totalPinMessages = PinMessage::count();
        $this->command->info("✅ Pin messages seeded successfully! Total: {$totalPinMessages} pin messages");
    }

    /**
     * Create promotional pin messages.
     */
    private function createPromotionalMessages(): void
    {
        PinMessage::factory()
            ->count(3)
            ->active()
            ->promotional()
            ->create();

        $this->command->info('   🎉 Created 3 promotional pin messages');
    }

    /**
     * Create informational pin messages.
     */
    private function createInformationalMessages(): void
    {
        PinMessage::factory()
            ->count(2)
            ->active()
            ->informational()
            ->create();

        $this->command->info('   ℹ️ Created 2 informational pin messages');
    }

    /**
     * Create seasonal pin messages.
     */
    private function createSeasonalMessages(): void
    {
        PinMessage::factory()
            ->count(2)
            ->active()
            ->seasonal()
            ->create();

        $this->command->info('   🌸 Created 2 seasonal pin messages');
    }

    /**
     * Create welcome pin messages.
     */
    private function createWelcomeMessages(): void
    {
        PinMessage::factory()
            ->count(1)
            ->active()
            ->welcome()
            ->highPriority()
            ->create();

        $this->command->info('   👋 Created 1 welcome pin message');
    }

    /**
     * Create pin messages with and without media.
     */
    private function createMediaMessages(): void
    {
        // Create pin messages with media
        PinMessage::factory()
            ->count(3)
            ->active()
            ->withMedia()
            ->withButton()
            ->create();

        // Create pin messages without media
        PinMessage::factory()
            ->count(2)
            ->active()
            ->withoutMedia()
            ->withContent()
            ->create();

        $this->command->info('   📸 Created 3 with media and 2 without media pin messages');
    }

    /**
     * Create priority pin messages.
     */
    private function createPriorityMessages(): void
    {
        // Create high priority messages
        PinMessage::factory()
            ->count(2)
            ->active()
            ->highPriority()
            ->withButton()
            ->create();

        // Create low priority messages
        PinMessage::factory()
            ->count(2)
            ->active()
            ->lowPriority()
            ->create();

        // Create inactive messages
        PinMessage::factory()
            ->count(1)
            ->inactive()
            ->create();

        $this->command->info('   ⭐ Created 2 high priority, 2 low priority, and 1 inactive pin messages');
    }
}