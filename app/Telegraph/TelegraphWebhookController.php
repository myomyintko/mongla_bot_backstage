<?php

declare(strict_types=1);

namespace App\Telegraph;

use App\Services\TelegraphBot\TelegraphBotServiceInterface;
use App\Telegraph\Handlers\CallbackHandler;
use App\Telegraph\Handlers\CommandHandler;
use App\Telegraph\Handlers\MessageHandler;
use DefStudio\Telegraph\Handlers\WebhookHandler;
use DefStudio\Telegraph\Models\TelegraphBot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TelegraphWebhookController extends WebhookHandler
{
    public function __construct(
        private TelegraphBotServiceInterface $telegraphBotService
    ) {
    }

    public function handle(Request $request, TelegraphBot $bot): void
    {
        Log::info('Telegraph webhook received', [
            'data' => $request->all(),
            'bot_id' => $bot->id,
        ]);

        // Call parent handle method which will call our overridden handleMessage() and handleCallbackQuery()
        parent::handle($request, $bot);
    }

    protected function handleMessage(): void
    {
        $message = $this->message;
        $text = $message->text();

        Log::info('Handling message', [
            'text' => $text,
            'chat_id' => $message->chat()->id(),
            'user_id' => $message->from()->id(),
        ]);

        // Handle commands
        if (str_starts_with($text, '/')) {
            $commandHandler = new CommandHandler($this->telegraphBotService, $this->chat, $message);
            $commandHandler->handleCommand(Str::of($text));
            return;
        }

        // Handle regular messages
        $messageHandler = new MessageHandler($this->telegraphBotService, $this->chat, $message);
        $messageHandler->handleRegularMessage($text);
    }

    protected function handleCallbackQuery(): void
    {
        $callbackHandler = new CallbackHandler(
            $this->telegraphBotService,
            $this->chat,
            $this->callbackQuery
        );
        
        $callbackHandler->handleCallbackQuery();
    }
}