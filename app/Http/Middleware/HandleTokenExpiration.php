<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;

class HandleTokenExpiration
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // If the response is 401 (Unauthenticated), check if it's due to token expiration
        if ($response->getStatusCode() === 401 && $request->bearerToken()) {
            try {
                // Try to find the token in the database
                $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken());
                
                if ($token && $token->expires_at && $token->expires_at->isPast()) {
                    // Token is expired, set user status to INACTIVE
                    $user = $token->tokenable;
                    if ($user && $user->status === User::STATUS_ACTIVE) {
                        $user->update(['status' => User::STATUS_INACTIVE]);
                    }
                }
            } catch (\Exception $e) {
                // Ignore errors in token handling
            }
        }

        return $response;
    }
}
