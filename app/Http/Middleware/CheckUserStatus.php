<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip status check for login and logout routes
        $path = $request->path();
        if (str_starts_with($path, 'api/auth/login') || str_starts_with($path, 'api/auth/logout')) {
            return $next($request);
        }
        
        $user = $request->user();
        
        // If user is authenticated, refresh from database to get latest status
        if ($user) {
            $user->refresh();
        }
        
        // If user is authenticated and suspended, force logout
        if ($user && $user->status === User::STATUS_SUSPENDED) {
            // Revoke all tokens for this user
            $user->tokens()->delete();
            
            // Clear remember token
            $user->update(['remember_token' => null]);
            
            return response()->json([
                'message' => 'Your account has been suspended. You have been logged out.',
                'suspended' => true,
            ], 401);
        }
        
        return $next($request);
    }
}
