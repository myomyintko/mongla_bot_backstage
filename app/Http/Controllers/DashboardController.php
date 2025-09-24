<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\Advertisement;
use DefStudio\Telegraph\Models\TelegraphChat;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get main dashboard overview statistics
     */
    public function overview(): JsonResponse
    {
        $activeStores = Store::where('status', 1)->count();
        $subscriptions = TelegraphChat::count();
        // Mock revenue and sales data
        $totalRevenue = $activeStores * rand(2000, 8000);
        $sales = $activeStores * rand(50, 200);
        $activeNow = TelegraphChat::where('updated_at', '>', Carbon::now()->subMinutes(5))->count();

        return response()->json([
            'total_revenue' => $totalRevenue,
            'subscriptions' => $subscriptions,
            'sales' => $sales,
            'active_now' => $activeNow,
        ]);
    }

    /**
     * Get monthly revenue data for chart
     */
    public function monthlyRevenue(): JsonResponse
    {
        $monthlyData = [];
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for ($i = 0; $i < 12; $i++) {
            // Mock monthly revenue data
            $revenue = rand(1000, 6000);

            $monthlyData[] = [
                'name' => $months[$i],
                'total' => $revenue
            ];
        }

        return response()->json($monthlyData);
    }

    /**
     * Get recent sales data
     */
    public function recentSales(): JsonResponse
    {
        $recentCustomers = TelegraphChat::select(['chat_id', 'name', 'created_at'])
            ->whereNotNull('name')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($customer) {
                $amount = rand(10, 500); // Mock sales amount

                // Parse the name to extract username if it's in format "[private] username"
                $name = $customer->name;
                $username = null;
                $displayName = $name;

                if (preg_match('/\[private\]\s*(.+)/', $name, $matches)) {
                    $username = $matches[1];
                    $displayName = ucfirst($username);
                }

                return [
                    'name' => $displayName,
                    'email' => $username ? "@{$username}" : "user_{$customer->chat_id}",
                    'amount' => "$" . number_format($amount, 2),
                ];
            });

        return response()->json([
            'data' => $recentCustomers
        ]);
    }
}