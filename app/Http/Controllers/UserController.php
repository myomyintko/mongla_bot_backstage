<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\User\UserServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function __construct(
        private UserServiceInterface $userService
    ) {}
    /**
     * Display a listing of users
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'status' => $request->get('status'),
            'role' => $request->get('role'),
            'search' => $request->get('search'),
        ];

        $perPage = (int) $request->get('per_page', 15);
        $users = $this->userService->getPaginated($filters, $perPage);

        return response()->json($users);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'nullable|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'status' => 'required|integer|in:1,2,4',
            'role' => 'required|string|exists:roles,name',
        ]);

        $user = $this->userService->create($validated);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $this->userService->getUserRepository()->transformUserData($user),
        ], 201);
    }

    /**
     * Display the specified user
     */
    public function show(User $user): JsonResponse
    {
        return response()->json(
            $this->userService->getUserRepository()->transformUserData($user)
        );
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'nullable|string|max:255',
            'username' => ['required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'status' => 'required|integer|in:1,2,4',
            'role' => 'required|string|exists:roles,name',
        ]);

        $user = $this->userService->update($user, $validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $this->userService->getUserRepository()->transformUserData($user),
        ]);
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user): JsonResponse
    {
        try {
            $this->userService->delete($user);
            
            return response()->json([
                'message' => 'User deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Bulk update users
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'status' => 'required|integer|in:1,2,4',
        ]);

        $result = $this->userService->bulkUpdate($validated['user_ids'], $validated);

        return response()->json($result);
    }

    /**
     * Bulk delete users
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        try {
            $result = $this->userService->bulkDelete($validated['user_ids']);
            
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get available roles
     */
    public function roles(): JsonResponse
    {
        $roles = $this->userService->getRoles();

        return response()->json($roles);
    }

    public function statuses(): JsonResponse
    {
        $statuses = $this->userService->getStatuses();

        return response()->json($statuses);
    }

}