<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Services\Auth\AuthServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private AuthServiceInterface $authService
    ) {}
    /**
     * Handle user login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');
        $rememberMe = $request->boolean('remember', false);
        
        $result = $this->authService->login($credentials, $rememberMe);

        return response()->json($result);
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

        $result = $this->authService->verifyTwoFactor($user, $request->code);

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
            ], 400);
        }

        return response()->json($result);
    }

    /**
     * Setup password for new users
     */
    public function setupPassword(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string|min:7',
            'password_confirmation' => 'required|string|min:7',
        ]);

        // Manual password confirmation validation
        if ($request->password !== $request->password_confirmation) {
            return response()->json([
                'message' => 'The password confirmation does not match.',
                'errors' => [
                    'password_confirmation' => ['The password confirmation does not match.']
                ]
            ], 422);
        }

        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated',
            ], 401);
        }

        $result = $this->authService->setupPassword($user, $request->password);

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
            ], 400);
        }

        return response()->json([
            'message' => $result['message'],
        ]);
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $result = $this->authService->logout($user);

        return response()->json([
            'message' => $result['message'],
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        $result = $this->authService->getAuthenticatedUser($user);

        return response()->json($result);
    }
}
