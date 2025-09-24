<?php

declare(strict_types=1);

namespace App\Services\TelegraphBot;

use DefStudio\Telegraph\Models\TelegraphBot;
use DefStudio\Telegraph\Models\TelegraphChat;
use DefStudio\Telegraph\Keyboard\Keyboard;
use App\Repositories\TelegraphBot\TelegraphBotRepositoryInterface;
use App\Repositories\TelegraphChat\TelegraphChatRepositoryInterface;
use App\Repositories\Store\StoreRepositoryInterface;
use App\Repositories\MenuButton\MenuButtonRepositoryInterface;
use App\Services\BotTemplate\BotTemplateServiceInterface;
use App\Services\NetworkRetry\NetworkRetryService;
use Illuminate\Support\Facades\Log;

class TelegraphBotService implements TelegraphBotServiceInterface
{
    public function __construct(
        private TelegraphBotRepositoryInterface $botRepository,
        private TelegraphChatRepositoryInterface $telegraphChatRepository,
        private StoreRepositoryInterface $storeRepository,
        private MenuButtonRepositoryInterface $menuButtonRepository,
        private BotTemplateServiceInterface $botTemplateService
    ) {
    }

    /**
     * Get the configured bot from environment variables
     */
    public function getConfiguredBot(): ?TelegraphBot
    {
        return $this->botRepository->getConfiguredBot();
    }

    /**
     * Get bot information from Telegram API
     */
    public function getBotInfo(): array
    {
        $bot = $this->getConfiguredBot();

        if (!$bot) {
            return [
                'success' => false,
                'message' => 'Bot not configured. Please set TELEGRAM_BOT_TOKEN in your .env file.'
            ];
        }

        try {
            // Skip actual API call in testing environment
            if (app()->environment('testing')) {
                return [
                    'success' => true,
                    'data' => [
                        'id' => 123456789,
                        'is_bot' => true,
                        'first_name' => 'Test Bot',
                        'username' => 'test_bot',
                        'can_join_groups' => true,
                        'can_read_all_group_messages' => false,
                        'support_inline_queries' => false,
                    ]
                ];
            }

            $info = $bot->info();

            return [
                'success' => true,
                'data' => $info
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get bot info', [
                'error' => $e->getMessage(),
                'bot_id' => $bot->id,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get bot info: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Register webhook for the configured bot
     */
    public function registerWebhook(): array
    {
        $bot = $this->getConfiguredBot();

        if (!$bot) {
            return [
                'success' => false,
                'message' => 'Bot not configured. Please set TELEGRAM_BOT_TOKEN in your .env file.'
            ];
        }

        try {
            // Check if domain is configured
            $domain = config('telegraph.webhook.domain');
            if (!$domain) {
                return [
                    'success' => false,
                    'message' => 'Webhook domain not configured. Please set TELEGRAPH_WEBHOOK_DOMAIN in your .env file.'
                ];
            }

            $result = $bot->registerWebhook()->send();

            Log::info('Webhook registered successfully', ['bot_id' => $bot->id, 'result' => $result]);

            return [
                'success' => true,
                'message' => 'Webhook registered successfully!'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to register webhook', [
                'error' => $e->getMessage(),
                'bot_id' => $bot->id,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to register webhook: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Unregister webhook for the configured bot
     */
    public function unregisterWebhook(): array
    {
        $bot = $this->getConfiguredBot();

        if (!$bot) {
            return [
                'success' => false,
                'message' => 'Bot not configured. Please set TELEGRAM_BOT_TOKEN in your .env file.'
            ];
        }

        try {
            // Always allow unregistering webhook (no domain check needed)
            $result = $bot->unregisterWebhook()->send();

            Log::info('Webhook unregistered successfully', ['bot_id' => $bot->id, 'result' => $result]);

            return [
                'success' => true,
                'message' => 'Webhook unregistered successfully!'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to unregister webhook', [
                'error' => $e->getMessage(),
                'bot_id' => $bot->id,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to unregister webhook: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Send test message from the configured bot
     */
    public function sendTestMessage(): array
    {
        $bot = $this->getConfiguredBot();

        if (!$bot) {
            return [
                'success' => false,
                'message' => 'Bot not configured. Please set TELEGRAM_BOT_TOKEN in your .env file.'
            ];
        }

        try {
            // Get the first chat for this bot
            $chat = $bot->chats()->first();

            if (!$chat) {
                return [
                    'success' => false,
                    'message' => 'No chats found for this bot. To test the bot, you need to start a conversation with it first. Send /start to your bot on Telegram, then try again.'
                ];
            }

            // Skip sending only if no domain is configured
            $domain = config('telegraph.webhook.domain');
            if ((app()->environment('local') || app()->environment('testing')) && !$domain) {
                return [
                    'success' => true,
                    'message' => 'Test message would be sent to ' . $chat->name . ' (skipped in ' . app()->environment() . ' environment - no domain configured)'
                ];
            }

            $bot->message('🤖 Test message from Mongolia Bot!')
                ->keyboard(\DefStudio\Telegraph\Keyboard\Keyboard::make()->buttons([
                    \DefStudio\Telegraph\Keyboard\Button::make('✅ Test Successful')->action('test_success'),
                ]))
                ->chat($chat)
                ->send();

            Log::info('Test message sent', ['bot_id' => $bot->id, 'chat_id' => $chat->id]);

            return [
                'success' => true,
                'message' => 'Test message sent successfully to ' . $chat->name . '!'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to send test message', [
                'error' => $e->getMessage(),
                'bot_id' => $bot->id,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to send test message: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Process incoming webhook update
     */
    public function processWebhookUpdate(array $update): array
    {
        try {
            // Handle message
            if (isset($update['message'])) {
                return $this->handleMessage($update['message']);
            }

            // Handle callback query (inline keyboard button clicks)
            if (isset($update['callback_query'])) {
                return $this->handleCallbackQuery($update['callback_query']);
            }

            return [
                'success' => true,
                'message' => 'Update processed successfully',
                'type' => 'unknown'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to process webhook update', [
                'error' => $e->getMessage(),
                'update' => $update,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to process webhook update: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Handle incoming message
     */
    public function handleMessage(array $message): array
    {
        try {
            $chatId = (string) $message['chat']['id'];
            $text = $message['text'] ?? '';
            $from = $message['from'] ?? [];

            // Check if it's a command
            if (str_starts_with($text, '/')) {
                $command = explode(' ', $text)[0];
                return $this->handleCommand($command, $message);
            }

            // Handle regular message
            $response = $this->sendMessage($chatId, "Thanks for your message: " . $text);

            return [
                'success' => true,
                'message' => 'Message handled successfully',
                'type' => 'message',
                'response' => $response
            ];
        } catch (\Exception $e) {
            Log::error('Failed to handle message', [
                'error' => $e->getMessage(),
                'message' => $message,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to handle message: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Handle incoming callback query (inline keyboard button clicks)
     */
    public function handleCallbackQuery(array $callbackQuery): array
    {
        try {
            $callbackQueryId = $callbackQuery['id'];
            $data = $callbackQuery['data'] ?? '';
            $message = $callbackQuery['message'] ?? [];
            $from = $callbackQuery['from'] ?? [];

            // Answer the callback query first
            $this->answerCallbackQuery($callbackQueryId, "Button clicked: " . $data);

            // Handle different callback data
            switch ($data) {
                case 'test_success':
                    $this->editMessageText(
                        (string) $message['chat']['id'],
                        $message['message_id'],
                        "✅ Test successful! Button was clicked."
                    );
                    break;

                default:
                    $this->editMessageText(
                        (string) $message['chat']['id'],
                        $message['message_id'],
                        "You clicked: " . $data
                    );
                    break;
            }

            return [
                'success' => true,
                'message' => 'Callback query handled successfully',
                'type' => 'callback_query',
                'data' => $data
            ];
        } catch (\Exception $e) {
            Log::error('Failed to handle callback query', [
                'error' => $e->getMessage(),
                'callback_query' => $callbackQuery,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to handle callback query: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Handle incoming command
     */
    public function handleCommand(string $command, array $message): array
    {
        try {
            $chatId = (string) $message['chat']['id'];
            $from = $message['from'] ?? [];

            switch ($command) {
                case '/start':
                    $keyboard = [
                        [
                            ['text' => '📋 Menu', 'callback_data' => 'show_menu'],
                            ['text' => 'ℹ️ Info', 'callback_data' => 'show_info']
                        ],
                        [
                            ['text' => '🏪 Stores', 'callback_data' => 'show_stores'],
                            ['text' => '📢 Ads', 'callback_data' => 'show_ads']
                        ]
                    ];

                    $response = $this->sendMessageWithKeyboard(
                        $chatId,
                        "🤖 Welcome to Mongolia Bot!\n\nChoose an option below:",
                        $keyboard
                    );
                    break;

                case '/help':
                    $response = $this->sendMessage(
                        $chatId,
                        "📖 Available commands:\n\n" .
                        "/start - Start the bot\n" .
                        "/help - Show this help message\n" .
                        "/menu - Show main menu\n" .
                        "/info - Show bot information"
                    );
                    break;

                case '/menu':
                    $keyboard = [
                        [
                            ['text' => '🏪 Browse Stores', 'callback_data' => 'browse_stores'],
                            ['text' => '📢 View Ads', 'callback_data' => 'view_ads']
                        ],
                        [
                            ['text' => '📞 Contact', 'callback_data' => 'contact'],
                            ['text' => 'ℹ️ About', 'callback_data' => 'about']
                        ]
                    ];

                    $response = $this->sendMessageWithKeyboard(
                        $chatId,
                        "📋 Main Menu\n\nSelect what you'd like to do:",
                        $keyboard
                    );
                    break;

                case '/info':
                    $response = $this->sendMessage(
                        $chatId,
                        "ℹ️ Bot Information\n\n" .
                        "🤖 Name: Mongolia Bot\n" .
                        "📅 Version: 1.0.0\n" .
                        "🔧 Status: Active\n" .
                        "📞 Support: Contact us for help"
                    );
                    break;

                default:
                    $response = $this->sendMessage(
                        $chatId,
                        "❓ Unknown command: " . $command . "\n\nUse /help to see available commands."
                    );
                    break;
            }

            return [
                'success' => true,
                'message' => 'Command handled successfully',
                'type' => 'command',
                'command' => $command,
                'response' => $response
            ];
        } catch (\Exception $e) {
            Log::error('Failed to handle command', [
                'error' => $e->getMessage(),
                'command' => $command,
                'message' => $message,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to handle command: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Send message to a specific chat
     */
    public function sendMessage(string $chatId, string $text, array $options = []): array
    {
        $bot = $this->getConfiguredBot();

        if (!$bot) {
            return [
                'success' => false,
                'message' => 'Bot not configured'
            ];
        }

        // Skip sending only if no domain is configured
        $domain = config('telegraph.webhook.domain');
        if ((app()->environment('local') || app()->environment('testing')) && !$domain) {
            return [
                'success' => true,
                'message' => "Message would be sent to chat {$chatId}: {$text} (skipped in " . app()->environment() . " environment - no domain configured)"
            ];
        }

        // Use NetworkRetryService for reliable delivery
        return NetworkRetryService::executeWithRetry(
            function () use ($chatId, $text, $bot) {
                try {
                    // Find or create the chat and send message
                    $chat = TelegraphChat::where('chat_id', $chatId)
                        ->where('telegraph_bot_id', $bot->id)
                        ->first();

                    if (!$chat) {
                        $chat = new TelegraphChat();
                        $chat->chat_id = $chatId;
                        $chat->name = 'User ' . $chatId;
                        $chat->telegraph_bot_id = $bot->id;
                        $chat->save();
                    }

                    $response = $chat->message($text)->send();

                    Log::info('Message sent', ['chat_id' => $chatId, 'text' => $text]);

                    return [
                        'success' => true,
                        'message' => 'Message sent successfully',
                        'response' => $response
                    ];
                } catch (\Exception $e) {
                    Log::error('Exception in sendMessage operation', [
                        'error' => $e->getMessage(),
                        'chat_id' => $chatId,
                        'text' => $text,
                    ]);

                    return [
                        'success' => false,
                        'message' => 'Failed to send message: ' . $e->getMessage(),
                        'error_type' => 'send_message_error'
                    ];
                }
            },
            "send_message_to_chat_{$chatId}",
            3,  // Max retries
            2   // Base delay seconds
        );
    }

    /**
     * Send message with inline keyboard
     */
    public function sendMessageWithKeyboard(string $chatId, string $text, array $keyboard, array $options = []): array
    {
        $bot = $this->getConfiguredBot();

        if (!$bot) {
            return [
                'success' => false,
                'message' => 'Bot not configured'
            ];
        }

        // Skip sending only if no domain is configured
        $domain = config('telegraph.webhook.domain');
        if ((app()->environment('local') || app()->environment('testing')) && !$domain) {
            return [
                'success' => true,
                'message' => "Message with keyboard would be sent to chat {$chatId}: {$text} (skipped in " . app()->environment() . " environment - no domain configured)"
            ];
        }

        // Use NetworkRetryService for reliable delivery
        return NetworkRetryService::executeWithRetry(
            function () use ($chatId, $text, $keyboard, $bot) {
                try {
                    // Convert array keyboard to Telegraph keyboard
                    $telegraphKeyboard = \DefStudio\Telegraph\Keyboard\Keyboard::make();
                    foreach ($keyboard as $row) {
                        $buttons = [];
                        foreach ($row as $button) {
                            $buttons[] = \DefStudio\Telegraph\Keyboard\Button::make($button['text'])->action($button['callback_data']);
                        }
                        $telegraphKeyboard->buttons($buttons);
                    }

                    $bot->message($text)
                        ->keyboard($telegraphKeyboard)
                        ->chat($chatId)
                        ->send();

                    Log::info('Message with keyboard sent', ['chat_id' => $chatId, 'text' => $text]);

                    return [
                        'success' => true,
                        'message' => 'Message with keyboard sent successfully'
                    ];
                } catch (\Exception $e) {
                    Log::error('Exception in sendMessageWithKeyboard operation', [
                        'error' => $e->getMessage(),
                        'chat_id' => $chatId,
                        'text' => $text,
                    ]);

                    return [
                        'success' => false,
                        'message' => 'Failed to send message with keyboard: ' . $e->getMessage(),
                        'error_type' => 'send_message_with_keyboard_error'
                    ];
                }
            },
            "send_message_with_keyboard_to_chat_{$chatId}",
            3,  // Max retries
            2   // Base delay seconds
        );
    }

    /**
     * Edit message text
     */
    public function editMessageText(string $chatId, int $messageId, string $text, array $options = []): array
    {
        $bot = $this->getConfiguredBot();

        if (!$bot) {
            return [
                'success' => false,
                'message' => 'Bot not configured'
            ];
        }

        try {
            // Skip editing only if no domain is configured
            $domain = config('telegraph.webhook.domain');
            if ((app()->environment('local') || app()->environment('testing')) && !$domain) {
                return [
                    'success' => true,
                    'message' => "Message would be edited in chat {$chatId}: {$text} (skipped in " . app()->environment() . " environment - no domain configured)"
                ];
            }

            $bot->editMessage($chatId, $messageId)->message($text)->send();

            Log::info('Message edited', ['chat_id' => $chatId, 'message_id' => $messageId, 'text' => $text]);

            return [
                'success' => true,
                'message' => 'Message edited successfully'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to edit message', [
                'error' => $e->getMessage(),
                'chat_id' => $chatId,
                'message_id' => $messageId,
                'text' => $text,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to edit message: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Answer callback query
     */
    public function answerCallbackQuery(string $callbackQueryId, string $text = '', bool $showAlert = false): array
    {
        $bot = $this->getConfiguredBot();

        if (!$bot) {
            return [
                'success' => false,
                'message' => 'Bot not configured'
            ];
        }

        try {
            // Skip answering only if no domain is configured
            $domain = config('telegraph.webhook.domain');
            if ((app()->environment('local') || app()->environment('testing')) && !$domain) {
                return [
                    'success' => true,
                    'message' => "Callback query would be answered: {$text} (skipped in " . app()->environment() . " environment - no domain configured)"
                ];
            }

            $bot->answerCallbackQuery($callbackQueryId, $text, $showAlert);

            Log::info('Callback query answered', ['callback_query_id' => $callbackQueryId, 'text' => $text]);

            return [
                'success' => true,
                'message' => 'Callback query answered successfully'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to answer callback query', [
                'error' => $e->getMessage(),
                'callback_query_id' => $callbackQueryId,
                'text' => $text,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to answer callback query: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get bot commands
     */
    public function getBotCommands(): array
    {
        $bot = $this->getConfiguredBot();

        if (!$bot) {
            return [
                'success' => false,
                'message' => 'Bot not configured'
            ];
        }

        try {
            // Skip API call in local development and testing
            if (app()->environment('local') || app()->environment('testing')) {
                return [
                    'success' => true,
                    'data' => [
                        ['command' => 'start', 'description' => 'Start the bot'],
                        ['command' => 'help', 'description' => 'Show help message'],
                        ['command' => 'menu', 'description' => 'Show main menu'],
                        ['command' => 'info', 'description' => 'Show bot information'],
                    ]
                ];
            }

            $commands = $bot->getCommands();

            return [
                'success' => true,
                'data' => $commands
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get bot commands', [
                'error' => $e->getMessage(),
                'bot_id' => $bot->id,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get bot commands: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Set bot commands
     */
    public function setBotCommands(array $commands): array
    {
        $bot = $this->getConfiguredBot();

        if (!$bot) {
            return [
                'success' => false,
                'message' => 'Bot not configured'
            ];
        }

        try {
            // Skip setting only if no domain is configured
            $domain = config('telegraph.webhook.domain');
            if ((app()->environment('local') || app()->environment('testing')) && !$domain) {
                return [
                    'success' => true,
                    'message' => 'Bot commands would be set (skipped in ' . app()->environment() . ' environment - no domain configured)',
                    'commands' => $commands
                ];
            }

            $bot->setCommands($commands);

            Log::info('Bot commands set', ['bot_id' => $bot->id, 'commands' => $commands]);

            return [
                'success' => true,
                'message' => 'Bot commands set successfully',
                'commands' => $commands
            ];
        } catch (\Exception $e) {
            Log::error('Failed to set bot commands', [
                'error' => $e->getMessage(),
                'bot_id' => $bot->id,
                'commands' => $commands,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to set bot commands: ' . $e->getMessage()
            ];
        }
    }

    protected function convertUrlToLocalPath(string $mediaUrl): string
    {
        // Parse the URL to get the path
        $parsedUrl = parse_url($mediaUrl);
        $path = $parsedUrl['path'] ?? '';

        // Remove leading slash if present
        $path = ltrim($path, '/');

        // Convert to absolute path
        $localPath = public_path($path);

        return $localPath;
    }

    /**
     * Send photo to a chat
     */
    public function sendMedia(string $chatId, string $media, string $mediaType, string $caption = '', ?Keyboard $socialKeyboard = null): array
    {
        $bot = $this->getConfiguredBot();

        if (!$bot) {
            return [
                'success' => false,
                'message' => 'Bot not configured'
            ];
        }

        // Use NetworkRetryService for reliable delivery
        return NetworkRetryService::executeWithRetry(
            function () use ($chatId, $media, $mediaType, $caption, $socialKeyboard, $bot) {
                try {
                    if (str_contains($media, 'localhost')) {
                        // Send local file
                        $media = $this->convertUrlToLocalPath($media);
                    }

                    // Find or create the chat using repository
                    $chat = $this->telegraphChatRepository->getChatByChatIdAndBotId($chatId, $bot->id);

                    if (!$chat) {
                        $chat = $this->telegraphChatRepository->createOrUpdateChat([
                            'chat_id' => $chatId,
                            'name' => 'User ' . $chatId,
                            'telegraph_bot_id' => $bot->id,
                        ]);
                    }

                    // Send media with keyboard using the same pattern as CallbackHandler
                    if ($socialKeyboard !== null) {
                        Log::info('Sending with keyboard using direct method chaining', [
                            'keyboard_class' => get_class($socialKeyboard),
                            'keyboard_array' => $socialKeyboard->toArray()
                        ]);

                        switch ($mediaType) {
                            case 'photo':
                            case 'image':
                                $response = $chat->photo($media)
                                    ->message($caption)
                                    ->keyboard($socialKeyboard)
                                    ->send();
                                break;
                            case 'video':
                                $response = $chat->video($media)
                                    ->message($caption)
                                    ->keyboard($socialKeyboard)
                                    ->send();
                                break;
                            default:
                                $response = $chat->photo($media)
                                    ->message($caption)
                                    ->keyboard($socialKeyboard)
                                    ->send();
                                break;
                        }
                    } else {
                        Log::info('Sending without keyboard');

                        switch ($mediaType) {
                            case 'photo':
                            case 'image':
                                $response = $chat->photo($media)->message($caption)->send();
                                break;
                            case 'video':
                                $response = $chat->video($media)->message($caption)->send();
                                break;
                            default:
                                $response = $chat->photo($media)->message($caption)->send();
                                break;
                        }
                    }

                    // Log both the response and any potential keyboard info in the request
                    Log::info('message sent===================>', [
                        'response' => $response->json() ?? 'No response data',
                        'response_has_reply_markup' => isset($response->json()['result']['reply_markup'])
                    ]);

                    Log::info('Media sent', [
                        'chat_id' => $chatId,
                        'media' => $media,
                        'media_type' => $mediaType,
                        'caption' => $caption,
                    ]);

                    return [
                        'success' => true,
                        'message' => 'Media sent successfully'
                    ];
                } catch (\Exception $e) {
                    $errorMessage = $e->getMessage();

                    Log::error('Exception in sendMedia operation', [
                        'error' => $errorMessage,
                        'chat_id' => $chatId,
                        'media' => $media,
                        'media_type' => $mediaType,
                    ]);

                    return [
                        'success' => false,
                        'message' => 'Failed to send media: ' . $errorMessage,
                        'error_type' => 'send_media_error'
                    ];
                }
            },
            "send_media_to_chat_{$chatId}",
            3,  // Max retries
            2   // Base delay seconds
        );
    }


    /**
     * Set webhook domain for Telegraph
     */
    public function setWebhookDomain(string $domain): array
    {
        return [
            'success' => false,
            'message' => 'Webhook domain should be configured in .env file as TELEGRAPH_WEBHOOK_DOMAIN'
        ];
    }

    /**
     * Get current webhook domain
     */
    public function getWebhookDomain(): array
    {
        try {
            $domain = config('telegraph.webhook.domain');

            return [
                'success' => true,
                'data' => [
                    'domain' => $domain,
                    'webhook_url' => $domain ? $domain . '/telegraph/' . config('telegraph.bot.token') . '/webhook' : null
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get webhook domain', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get webhook domain: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get current webhook info from Telegram
     */
    public function getWebhookInfo(): array
    {
        $bot = $this->getConfiguredBot();

        if (!$bot) {
            return [
                'success' => false,
                'message' => 'Bot not configured'
            ];
        }

        try {
            // Always call the real API to get actual webhook status
            $response = $bot->getWebhookDebugInfo()->send();

            if ($response->telegraphOk()) {
                $webhookInfo = $response->json('result');

                return [
                    'success' => true,
                    'data' => $webhookInfo
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to get webhook info from Telegram API'
                ];
            }
        } catch (\Exception $e) {
            Log::error('Failed to get webhook info', [
                'error' => $e->getMessage(),
                'bot_id' => $bot->id,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get webhook info: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get trending stores for bot display
     */
    public function getTrendingStores(): array
    {
        try {
            $trendingStores = $this->storeRepository->getTrendingStores(6);

            return [
                'success' => true,
                'data' => $trendingStores->toArray()
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get trending stores', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get trending stores: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get root menu buttons for persistent keyboard
     */
    public function getRootMenuButtons(): array
    {
        try {
            $rootMenuButtons = $this->menuButtonRepository->getRootMenuButtons(16);

            return [
                'success' => true,
                'data' => $rootMenuButtons->toArray()
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get root menu buttons', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get root menu buttons: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get store details by ID
     */
    public function getStoreDetails(int $storeId): array
    {
        try {
            $store = $this->storeRepository->findById($storeId);

            if (!$store) {
                return [
                    'success' => false,
                    'message' => 'Store not found'
                ];
            }

            return [
                'success' => true,
                'data' => $store->toArray()
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get store details', [
                'error' => $e->getMessage(),
                'store_id' => $storeId,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get store details: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get menu button details by ID
     */
    public function getMenuButtonDetails(int $menuButtonId): array
    {
        try {
            $menuButton = $this->menuButtonRepository->findById($menuButtonId);

            if (!$menuButton) {
                return [
                    'success' => false,
                    'message' => 'Menu button not found'
                ];
            }

            return [
                'success' => true,
                'data' => $menuButton->toArray()
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get menu button details', [
                'error' => $e->getMessage(),
                'menu_button_id' => $menuButtonId,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get menu button details: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Search stores by keyword
     */
    public function searchStores(string $keyword): array
    {
        try {
            $stores = $this->storeRepository->searchStores($keyword, 10);

            return [
                'success' => true,
                'data' => $stores->toArray()
            ];
        } catch (\Exception $e) {
            Log::error('Failed to search stores', [
                'error' => $e->getMessage(),
                'keyword' => $keyword,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to search stores: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get stores by menu button ID with pagination
     */
    public function getStoresByMenuButton(int $menuButtonId, int $page = 1, int $perPage = 10): array
    {
        try {
            $stores = $this->storeRepository->getStoresByMenuButton($menuButtonId, $page, $perPage);
            $totalStores = $this->storeRepository->getStoresCountByMenuButton($menuButtonId);

            return [
                'success' => true,
                'data' => $stores->toArray(),
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $totalStores,
                    'total_pages' => ceil($totalStores / $perPage),
                    'has_next' => ($page * $perPage) < $totalStores,
                    'has_previous' => $page > 1
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get stores by menu button', [
                'error' => $e->getMessage(),
                'menu_button_id' => $menuButtonId,
                'page' => $page,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get stores: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get stores by menu button ID including all sub-menu stores with pagination
     */
    public function getStoresByMenuButtonWithChildren(int $menuButtonId, int $page = 1, int $perPage = 10): array
    {
        try {
            $stores = $this->storeRepository->getStoresByMenuButtonWithChildren($menuButtonId, $page, $perPage);
            $totalStores = $this->storeRepository->getStoresCountByMenuButtonWithChildren($menuButtonId);

            return [
                'success' => true,
                'data' => $stores->toArray(),
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $totalStores,
                    'total_pages' => ceil($totalStores / $perPage),
                    'has_next' => ($page * $perPage) < $totalStores,
                    'has_previous' => $page > 1
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get stores by menu button with children', [
                'error' => $e->getMessage(),
                'menu_button_id' => $menuButtonId,
                'page' => $page,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get stores: ' . $e->getMessage()
            ];
        }
    }

    public function getAllMenuButtons(): array
    {
        try {
            $menuButtons = $this->menuButtonRepository->getAll();

            return [
                'success' => true,
                'data' => $menuButtons->toArray()
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get all menu buttons', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get menu buttons: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get processed template content with variables
     */
    public function getTemplateContent(string $type, array $variables = []): string
    {
        // Add common variables
        $variables['currentTime'] = now()->format('g:i A');
        $variables['currentDate'] = now()->format('Y-m-d');

        return $this->botTemplateService->getProcessedContent($type, $variables);
    }
}
