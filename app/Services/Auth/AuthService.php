<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Models\User;
use App\Services\TwoFactor\TwoFactorServiceInterface;
use App\Services\User\UserServiceInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use PragmaRX\Google2FA\Google2FA;

class AuthService implements AuthServiceInterface
{
    protected Google2FA $google2fa;

    public function __construct(
        private UserServiceInterface $userService,
        private TwoFactorServiceInterface $twoFactorService
    ) {
        $this->google2fa = new Google2FA();
    }

    public function login(array $credentials, bool $rememberMe = false): array
    {
        if (!Auth::attempt($credentials, $rememberMe)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();
        
        // Check if user needs to setup password
        if ($user->needsPasswordSetup()) {
            // Create a temporary token for password setup
            $tokenName = $rememberMe ? 'setup-token' : 'setup-token';
            $token = $user->createToken($tokenName)->plainTextToken;
            
            return [
                'requires_password_setup' => true,
                'message' => 'Password setup required',
                'access_token' => $token,
                'token_type' => 'Bearer',
            ];
        }
        
        // Check if user has 2FA enabled
        if ($user->hasTwoFactorEnabled()) {
            // Don't create token yet, require 2FA verification
            return [
                'requires_two_factor' => true,
                'message' => 'Two-factor authentication required',
            ];
        }
        
        // Set user status to ACTIVE after successful login
        $this->userService->update($user, ['status' => User::STATUS_ACTIVE]);
        
        // Create API token
        $tokenName = $rememberMe ? 'remember-token' : 'auth-token';
        $token = $user->createToken($tokenName)->plainTextToken;

        return [
            'user' => $this->transformUserData($user),
            'access_token' => $token,
            'token_type' => 'Bearer',
            'remember_me' => $rememberMe,
        ];
    }

    public function verifyTwoFactor(User $user, string $code): array
    {
        if (!$user->hasTwoFactorEnabled()) {
            return [
                'success' => false,
                'message' => 'Two-factor authentication is not enabled for this account',
            ];
        }

        // Verify the 2FA code
        $twoFactorAuth = $user->twoFactorAuthentication;
        $valid = $this->google2fa->verifyKey($twoFactorAuth->secret_key, $code);

        if (!$valid) {
            return [
                'success' => false,
                'message' => 'Invalid verification code',
            ];
        }

        // Set user status to ACTIVE after successful 2FA verification
        $this->userService->update($user, ['status' => User::STATUS_ACTIVE]);
        
        // Create API token
        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'success' => true,
            'user' => $this->transformUserData($user),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ];
    }

    public function setupPassword(User $user, string $password): array
    {
        if (!$user->needsPasswordSetup()) {
            return [
                'success' => false,
                'message' => 'Password setup is not required for this account',
            ];
        }

        // Update password and mark setup as complete
        $this->userService->update($user, [
            'password' => $password, // UserService will handle hashing
            'password_setup_required' => false,
        ]);

        return [
            'success' => true,
            'message' => 'Password setup completed successfully',
        ];
    }

    public function logout(User $user): array
    {
        // Set user status to INACTIVE when logging out
        $this->userService->update($user, ['status' => User::STATUS_INACTIVE]);
        
        // Delete the current access token
        $user->currentAccessToken()->delete();

        return [
            'success' => true,
            'message' => 'Successfully logged out',
        ];
    }

    public function getAuthenticatedUser(User $user): array
    {
        return [
            'user' => $this->transformUserData($user),
        ];
    }

    public function transformUserData(User $user): array
    {
        return [
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
        ];
    }
}
