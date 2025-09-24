<?php

declare(strict_types=1);

namespace App\Services\Profile;

use App\Models\User;

interface ProfileServiceInterface
{
    /**
     * Get the current user's profile data
     */
    public function getCurrentUserProfile(): array;

    /**
     * Update the current user's profile
     */
    public function updateProfile(User $user, array $data): User;

    /**
     * Update the current user's avatar
     */
    public function updateAvatar(User $user, string $avatar): User;

    /**
     * Update the current user's password
     */
    public function updatePassword(User $user, string $currentPassword, string $newPassword): array;

    /**
     * Transform user data for profile response
     */
    public function transformUserData(User $user): array;
}
