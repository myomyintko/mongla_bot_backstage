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

}