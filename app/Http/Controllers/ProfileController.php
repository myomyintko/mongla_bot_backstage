<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\Profile\ProfileServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function __construct(
        private ProfileServiceInterface $profileService
    ) {}
    /**
     * Get the current user's profile
     */
    public function show(): JsonResponse
    {
        $userData = $this->profileService->getCurrentUserProfile();
        
        return response()->json([
            'user' => $userData
        ]);
    }

    /**
     * Update the current user's profile
     */
    public function update(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user = $this->profileService->updateProfile($user, $validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $this->profileService->transformUserData($user)
        ]);
    }

    /**
     * Update the current user's avatar
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'avatar' => 'nullable|string|max:500',
        ]);

        $user = $this->profileService->updateAvatar($user, $validated['avatar']);

        return response()->json([
            'message' => 'Avatar updated successfully',
            'avatar' => $user->avatar,
        ]);
    }

    /**
     * Update the current user's password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $result = $this->profileService->updatePassword(
            $user,
            $validated['current_password'],
            $validated['new_password']
        );

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'message' => $result['message'],
        ]);
    }
}