<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\TelegraphBot\TelegraphBotServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TelegraphBotController extends Controller
{
    public function __construct(
        private TelegraphBotServiceInterface $botService
    ) {}

    /**
     * Get the configured bot information
     */
    public function index(): JsonResponse
    {
        $bot = $this->botService->getConfiguredBot();
        
        if (!$bot) {
            return response()->json([
                'success' => false,
                'message' => 'Bot not configured. Please set TELEGRAM_BOT_TOKEN in your .env file.'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $bot->id,
                'name' => $bot->name,
                'username' => $bot->username,
                'token' => $bot->token,
                'chats' => $bot->chats,
                'created_at' => $bot->created_at,
                'updated_at' => $bot->updated_at,
            ]
        ]);
    }

    /**
     * Get bot information from Telegram API
     */
    public function getBotInfo(): JsonResponse
    {
        $result = $this->botService->getBotInfo();
        
        $statusCode = $result['success'] ? 200 : 500;
        
        return response()->json($result, $statusCode);
    }

    /**
     * Register webhook for the configured bot
     */
    public function registerWebhook(): JsonResponse
    {
        $result = $this->botService->registerWebhook();
        
        $statusCode = $result['success'] ? 200 : 500;
        
        return response()->json($result, $statusCode);
    }

    /**
     * Unregister webhook for the configured bot
     */
    public function unregisterWebhook(): JsonResponse
    {
        $result = $this->botService->unregisterWebhook();
        
        $statusCode = $result['success'] ? 200 : 500;
        
        return response()->json($result, $statusCode);
    }

    /**
     * Send test message from the configured bot
     */
    public function sendTestMessage(): JsonResponse
    {
        $result = $this->botService->sendTestMessage();
        
        $statusCode = $result['success'] ? 200 : 400;
        
        return response()->json($result, $statusCode);
    }


    /**
     * Get current webhook domain
     */
    public function getWebhookDomain(): JsonResponse
    {
        $result = $this->botService->getWebhookDomain();
        
        $statusCode = $result['success'] ? 200 : 500;
        
        return response()->json($result, $statusCode);
    }

    /**
     * Get current webhook info
     */
    public function getWebhookInfo(): JsonResponse
    {
        $result = $this->botService->getWebhookInfo();

        $statusCode = $result['success'] ? 200 : 500;

        return response()->json($result, $statusCode);
    }

    /**
     * Get current Telegraph configuration
     */
    public function getConfig(): JsonResponse
    {
        try {
            $config = [
                'bot_token' => config('telegraph.bot.token'),
                'bot_name' => config('telegraph.bot.name'),
                'bot_username' => config('telegraph.bot.username'),
                'webhook_domain' => config('telegraph.webhook.domain'),
                'webhook_secret' => config('telegraph.webhook.secret'),
                'max_connections' => config('telegraph.webhook.max_connections'),
                'http_timeout' => config('telegraph.http_timeout'),
                'http_connection_timeout' => config('telegraph.http_connection_timeout'),
                'default_parse_mode' => config('telegraph.default_parse_mode'),
                'report_unknown_commands' => config('telegraph.webhook.report_unknown_commands'),
                'debug' => config('telegraph.webhook.debug'),
                'allow_callback_queries_from_unknown_chats' => config('telegraph.security.allow_callback_queries_from_unknown_chats'),
                'allow_messages_from_unknown_chats' => config('telegraph.security.allow_messages_from_unknown_chats'),
                'store_unknown_chats_in_db' => config('telegraph.security.store_unknown_chats_in_db'),
                'attachments' => config('telegraph.attachments'),
            ];

            return response()->json([
                'success' => true,
                'data' => $config
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get configuration: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update Telegraph configuration in .env file
     */
    public function updateConfig(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'bot_token' => 'sometimes|string|min:45|max:50',
                'bot_name' => 'sometimes|string|max:255',
                'bot_username' => 'sometimes|string|max:255',
                'webhook_domain' => 'sometimes|nullable|url',
                'webhook_secret' => 'sometimes|nullable|string|max:255',
                'max_connections' => 'sometimes|integer|min:1|max:100',
                'http_timeout' => 'sometimes|integer|min:1|max:300',
                'http_connection_timeout' => 'sometimes|integer|min:1|max:60',
                'default_parse_mode' => 'sometimes|string|in:markdown,html,MarkdownV2',
                'report_unknown_commands' => 'sometimes|boolean',
                'debug' => 'sometimes|boolean',
                'allow_callback_queries_from_unknown_chats' => 'sometimes|boolean',
                'allow_messages_from_unknown_chats' => 'sometimes|boolean',
                'store_unknown_chats_in_db' => 'sometimes|boolean',
            ]);

            // Read current .env file
            $envFile = base_path('.env');
            if (!file_exists($envFile)) {
                return response()->json([
                    'success' => false,
                    'message' => '.env file not found'
                ], 404);
            }

            $envContent = file_get_contents($envFile);

            // Update each configuration value
            foreach ($validated as $key => $value) {
                $envKey = match($key) {
                    'bot_token' => 'TELEGRAM_BOT_TOKEN',
                    'bot_name' => 'TELEGRAM_BOT_NAME',
                    'bot_username' => 'TELEGRAM_BOT_USERNAME',
                    'webhook_domain' => 'TELEGRAPH_WEBHOOK_DOMAIN',
                    'webhook_secret' => 'TELEGRAPH_WEBHOOK_SECRET',
                    'max_connections' => 'TELEGRAPH_WEBHOOK_MAX_CONNECTIONS',
                    'http_timeout' => 'TELEGRAPH_HTTP_TIMEOUT',
                    'http_connection_timeout' => 'TELEGRAPH_HTTP_CONNECTION_TIMEOUT',
                    'default_parse_mode' => 'TELEGRAPH_DEFAULT_PARSE_MODE',
                    'report_unknown_commands' => 'TELEGRAPH_REPORT_UNKNOWN_COMMANDS',
                    'debug' => 'TELEGRAPH_WEBHOOK_DEBUG',
                    'allow_callback_queries_from_unknown_chats' => 'TELEGRAPH_ALLOW_CALLBACK_QUERIES_FROM_UNKNOWN_CHATS',
                    'allow_messages_from_unknown_chats' => 'TELEGRAPH_ALLOW_MESSAGES_FROM_UNKNOWN_CHATS',
                    'store_unknown_chats_in_db' => 'TELEGRAPH_STORE_UNKNOWN_CHATS_IN_DB',
                    default => null,
                };

                if ($envKey) {
                    $envValue = is_bool($value) ? ($value ? 'true' : 'false') : $value;
                    $envValue = $envValue === null ? '' : $envValue;

                    // Wrap in quotes if it contains spaces or special characters
                    if (is_string($envValue) && (str_contains($envValue, ' ') || str_contains($envValue, '#'))) {
                        $envValue = '"' . str_replace('"', '\\"', $envValue) . '"';
                    }

                    // Check if key exists and update it, otherwise append
                    $pattern = '/^' . preg_quote($envKey, '/') . '=.*$/m';
                    if (preg_match($pattern, $envContent)) {
                        $envContent = preg_replace($pattern, $envKey . '=' . $envValue, $envContent);
                    } else {
                        $envContent .= "\n" . $envKey . '=' . $envValue;
                    }
                }
            }

            // Write back to .env file
            if (file_put_contents($envFile, $envContent) === false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to write to .env file'
                ], 500);
            }

            // Clear config cache to apply changes
            if (function_exists('opcache_reset')) {
                opcache_reset();
            }

            // Clear Laravel config cache
            \Artisan::call('config:clear');
            \Artisan::call('cache:clear');

            // Restart queue workers if any are running
            try {
                \Artisan::call('queue:restart');
            } catch (\Exception $e) {
                // Queue restart might fail if no workers are running, but that's okay
            }

            return response()->json([
                'success' => true,
                'message' => 'Configuration updated successfully and application restarted.',
                'updated_keys' => array_keys($validated)
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update configuration: ' . $e->getMessage()
            ], 500);
        }
    }

}