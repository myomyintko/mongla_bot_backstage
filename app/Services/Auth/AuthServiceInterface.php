<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Http\Request;

interface AuthServiceInterface
{
    /**
     * Handle user login
     */
    public function login(array $credentials, bool $rememberMe = false): array;

    /**
     * Verify two-factor authentication code
     */
    public function verifyTwoFactor(User $user, string $code): array;

    /**
     * Setup password for new users
     */
    public function setupPassword(User $user, string $password): array;

    /**
     * Handle user logout
     */
    public function logout(User $user): array;

    /**
     * Get authenticated user data
     */
    public function getAuthenticatedUser(User $user): array;

    /**
     * Transform user data for authentication response
     */
    public function transformUserData(User $user): array;
}
