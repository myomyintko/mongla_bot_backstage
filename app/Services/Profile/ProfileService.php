<?php

declare(strict_types=1);

namespace App\Services\Profile;

use App\Models\User;
use App\Services\User\UserServiceInterface;
use Illuminate\Support\Facades\Hash;

class ProfileService implements ProfileServiceInterface
{
    public function __construct(
        private UserServiceInterface $userService
    ) {}

    public function getCurrentUserProfile(): array
    {
        $user = auth()->user();
        return $this->transformUserData($user);
    }

    public function updateProfile(User $user, array $data): User
    {
        return $this->userService->update($user, $data);
    }

    public function updateAvatar(User $user, string $avatar): User
    {
        return $this->userService->update($user, ['avatar' => $avatar]);
    }

    public function updatePassword(User $user, string $currentPassword, string $newPassword): array
    {
        // Check if current password is correct
        if (!Hash::check($currentPassword, $user->password)) {
            return [
                'success' => false,
                'message' => 'Current password is incorrect',
            ];
        }

        // Update password
        $this->userService->update($user, [
            'password' => $newPassword, // The UserService will handle hashing
        ]);

        return [
            'success' => true,
            'message' => 'Password updated successfully',
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
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }
}
