<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use DefStudio\Telegraph\Models\TelegraphBot;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TelegraphBotTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed the database with permissions
        $this->seed(\Database\Seeders\TelegraphPermissionSeeder::class);
        
        // Create a user and authenticate for all tests
        $user = User::factory()->create();
        
        // Assign telegraph permissions to the user
        $user->givePermissionTo([
            'telegraph.view',
            'telegraph.create',
            'telegraph.edit',
            'telegraph.delete',
        ]);
        
        $token = $user->createToken('test-token')->plainTextToken;
        
        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ]);
    }

    public function test_can_get_configured_bot(): void
    {
        // Set environment variables for testing
        config(['telegraph.bot.token' => '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz']);
        config(['telegraph.bot.name' => 'Test Bot']);

        $response = $this->getJson('/api/telegraph/bot');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'token',
                    'created_at',
                    'updated_at',
                ]
            ]);
    }

    public function test_can_get_bot_info(): void
    {
        // Set environment variables for testing
        config(['telegraph.bot.token' => '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz']);

        $response = $this->getJson('/api/telegraph/bot/info');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_can_register_webhook(): void
    {
        // Set environment variables for testing
        config(['telegraph.bot.token' => '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz']);

        $response = $this->postJson('/api/telegraph/bot/register-webhook');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_can_unregister_webhook(): void
    {
        // Set environment variables for testing
        config(['telegraph.bot.token' => '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz']);

        $response = $this->postJson('/api/telegraph/bot/unregister-webhook');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_can_send_test_message(): void
    {
        // Set environment variables for testing
        config(['telegraph.bot.token' => '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz']);

        // Create a bot and chat for testing
        $bot = TelegraphBot::factory()->create([
            'token' => '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
            'name' => 'Test Bot',
        ]);

        // Create a chat for the bot
        $bot->chats()->create([
            'chat_id' => '123456789',
            'name' => 'Test Chat',
        ]);

        $response = $this->postJson('/api/telegraph/bot/send-test-message');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_returns_error_when_bot_not_configured(): void
    {
        // Don't set any bot configuration
        config(['telegraph.bot.token' => null]);

        $response = $this->getJson('/api/telegraph/bot');

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Bot not configured. Please set TELEGRAM_BOT_TOKEN in your .env file.'
            ]);
    }
}