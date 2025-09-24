<?php

declare(strict_types=1);

namespace App\Services\TwoFactor;

use App\Models\User;

interface TwoFactorServiceInterface
{
    /**
     * Generate 2FA setup data for the authenticated user
     */
    public function generateSecret(User $user): array;

    /**
     * Verify and enable 2FA for the authenticated user
     */
    public function enable(User $user, string $code): array;

    /**
     * Disable 2FA for the authenticated user
     */
    public function disable(User $user, string $code): array;

    /**
     * Verify 2FA code during login
     */
    public function verify(User $user, string $code): array;

    /**
     * Verify recovery code during login
     */
    public function verifyRecoveryCode(User $user, string $recoveryCode): array;

    /**
     * Get 2FA status for the authenticated user
     */
    public function getStatus(User $user): array;

    /**
     * Regenerate recovery codes
     */
    public function regenerateRecoveryCodes(User $user): array;
}
