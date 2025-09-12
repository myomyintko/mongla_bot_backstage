<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $request->authenticate();

        $user = Auth::user();
        $rememberMe = $request->boolean('remember', false);
        
        // Check if user needs to setup password
        if ($user->needsPasswordSetup()) {
            // Create a temporary token for password setup
            $tokenName = $rememberMe ? 'setup-token' : 'setup-token';
            $token = $user->createToken($tokenName)->plainTextToken;
            
            return response()->json([
                'requires_password_setup' => true,
                'message' => 'Password setup required',
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        }
        
        // Check if user has 2FA enabled
        if ($user->hasTwoFactorEnabled()) {
            // Don't create token yet, require 2FA verification
            return response()->json([
                'requires_two_factor' => true,
                'message' => 'Two-factor authentication required',
            ]);
        }
        
        // Set user status to ACTIVE after successful login
        $user->update(['status' => User::STATUS_ACTIVE]);
        
        // Create API token (Laravel's remember_token is handled automatically by Auth::attempt)
        $tokenName = $rememberMe ? 'remember-token' : 'auth-token';
        $token = $user->createToken($tokenName)->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
            'remember_me' => $rememberMe,
        ]);
    }

    /**
     * Verify two-factor authentication code
     */
    public function verifyTwoFactor(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated',
            ], 401);
        }

        if (!$user->hasTwoFactorEnabled()) {
            return response()->json([
                'message' => 'Two-factor authentication is not enabled for this account',
            ], 400);
        }

        // Verify the 2FA code
        $twoFactorAuth = $user->twoFactorAuthentication;
        $google2fa = new \PragmaRX\Google2FA\Google2FA();
        
        $valid = $google2fa->verifyKey($twoFactorAuth->secret_key, $request->code);

        if (!$valid) {
            return response()->json([
                'message' => 'Invalid verification code',
            ], 400);
        }

        // Set user status to ACTIVE after successful 2FA verification
        $user->update(['status' => User::STATUS_ACTIVE]);
        
        // Create API token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Setup password for new users
     */
    public function setupPassword(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string|min:7|confirmed',
        ]);

        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated',
            ], 401);
        }

        if (!$user->needsPasswordSetup()) {
            return response()->json([
                'message' => 'Password setup is not required for this account',
            ], 400);
        }

        // Update password and mark setup as complete
        $user->update([
            'password' => $request->password,
            'password_setup_required' => false,
        ]);

        return response()->json([
            'message' => 'Password setup completed successfully',
        ]);
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Set user status to INACTIVE when logging out
        $user->update(['status' => User::STATUS_INACTIVE]);
        
        // Delete the current access token
        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
        ]);
    }
}
