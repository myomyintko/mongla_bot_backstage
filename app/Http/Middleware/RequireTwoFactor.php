<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RequireTwoFactor
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip 2FA check for guests
        if (!Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();

        // Skip 2FA check if user doesn't have 2FA enabled
        if (!$user->hasTwoFactorEnabled()) {
            return $next($request);
        }

        // Skip 2FA check for 2FA-related routes
        $excludedRoutes = [
            'two-factor.*',
            'logout',
            'auth.logout',
        ];

        $currentRoute = $request->route()?->getName();
        foreach ($excludedRoutes as $excludedRoute) {
            if ($currentRoute && fnmatch($excludedRoute, $currentRoute)) {
                return $next($request);
            }
        }

        // Check if 2FA is already verified for this session
        if ($user->isTwoFactorVerified()) {
            return $next($request);
        }

        // For API requests, return 403 with 2FA required flag
        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication required.',
                'requires_2fa' => true,
            ], 403);
        }

        // For web requests, redirect to 2FA verification page
        return redirect()->route('two-factor.verify');
    }
}
