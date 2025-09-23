<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Repositories\TelegraphChat\TelegraphChatRepositoryInterface;
use DefStudio\Telegraph\Models\TelegraphBot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CustomerController extends Controller
{
    public function __construct(
        private TelegraphChatRepositoryInterface $telegraphChatRepository
    ) {}

    /**
     * Get dashboard statistics for customers
     */
    public function stats(): JsonResponse
    {
        $bot = TelegraphBot::first();
        if (!$bot) {
            return response()->json([
                'total_customers' => 0,
                'new_customers_today' => 0,
                'growth_rate' => 0,
                'avg_order_value' => 0,
            ]);
        }

        $allChats = $this->telegraphChatRepository->getChatsByBotId($bot->id);
        $totalCustomers = $allChats->count();

        // Get customers from today
        $todayStart = Carbon::today();
        $newCustomersToday = $allChats->where('created_at', '>=', $todayStart)->count();

        // Get customers from yesterday for growth calculation
        $yesterdayStart = Carbon::yesterday();
        $yesterdayEnd = Carbon::today();
        $newCustomersYesterday = $allChats->whereBetween('created_at', [$yesterdayStart, $yesterdayEnd])->count();

        // Calculate growth rate
        $growthRate = $newCustomersYesterday > 0
            ? (($newCustomersToday - $newCustomersYesterday) / $newCustomersYesterday) * 100
            : ($newCustomersToday > 0 ? 100 : 0);

        return response()->json([
            'total_customers' => $totalCustomers,
            'new_customers_today' => $newCustomersToday,
            'growth_rate' => round($growthRate, 1),
            'avg_order_value' => 0, // This would need to be calculated from actual order data
        ]);
    }

    /**
     * Get recent customers for dashboard
     */
    public function recent(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 5);
        $bot = TelegraphBot::first();

        if (!$bot) {
            return response()->json([
                'data' => [],
                'total' => 0,
            ]);
        }

        $chats = $this->telegraphChatRepository->getChatsByBotId($bot->id);
        $recentChats = $chats->sortByDesc('created_at')->take($limit);

        $customers = $recentChats->map(function ($chat) {
            // Parse the name to extract username if it's in format "[private] username"
            $name = $chat->name;
            $username = null;
            $displayName = $name;

            if (preg_match('/\[private\]\s*(.+)/', $name, $matches)) {
                $username = $matches[1];
                $displayName = ucfirst($username);
            }

            return [
                'id' => $chat->chat_id,
                'name' => $displayName,
                'username' => $username,
                'status' => 'Active', // All Telegram users are considered active
                'join_date' => Carbon::parse($chat->created_at)->format('Y-m-d'),
                'join_date_formatted' => Carbon::parse($chat->created_at)->format('M j, Y'),
                'created_at' => $chat->created_at,
            ];
        })->values();

        return response()->json([
            'data' => $customers,
            'total' => $chats->count(),
        ]);
    }

    /**
     * Get all customers with pagination
     */
    public function index(Request $request): JsonResponse
    {
        $page = $request->get('page', 1);
        $limit = $request->get('limit', 10);
        $search = $request->get('search', '');

        $bot = TelegraphBot::first();

        if (!$bot) {
            return response()->json([
                'data' => [],
                'total' => 0,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => 0,
            ]);
        }

        $query = $this->telegraphChatRepository->getChatsByBotId($bot->id);

        // Apply search filter if provided
        if ($search) {
            $query = $query->filter(function ($chat) use ($search) {
                return stripos($chat->name, $search) !== false ||
                       stripos($chat->chat_id, $search) !== false;
            });
        }

        $total = $query->count();
        $totalPages = ceil($total / $limit);
        $offset = ($page - 1) * $limit;

        $chats = $query->sortByDesc('created_at')->slice($offset, $limit);

        $customers = $chats->map(function ($chat) {
            // Parse the name to extract username if it's in format "[private] username"
            $name = $chat->name;
            $username = null;
            $displayName = $name;

            if (preg_match('/\[private\]\s*(.+)/', $name, $matches)) {
                $username = $matches[1];
                $displayName = ucfirst($username);
            }

            return [
                'id' => $chat->chat_id,
                'name' => $displayName,
                'username' => $username,
                'status' => 'Active',
                'join_date' => Carbon::parse($chat->created_at)->format('Y-m-d'),
                'join_date_formatted' => Carbon::parse($chat->created_at)->format('M j, Y'),
                'created_at' => $chat->created_at,
                'raw_name' => $chat->name,
            ];
        })->values();

        return response()->json([
            'data' => $customers,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $totalPages,
        ]);
    }
}