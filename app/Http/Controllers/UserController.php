<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['roles']);

        // Filter by status if provided
        if ($request->has('status') && is_array($request->status) && !empty($request->status)) {
            $query->whereIn('status', $request->status);
        }

        // Filter by role if provided
        if ($request->has('role') && is_array($request->role) && !empty($request->role)) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->whereIn('name', $request->role);
            });
        }

        // Search by username, name, or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', '%' . $search . '%')
                  ->orWhere('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        // Sort by created_at desc by default
        $query->orderBy('created_at', 'desc');

        $users = $query->paginate($request->get('per_page', 15));

        // Transform the response to match frontend expectations
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => (string) $user->id,
                'firstName' => explode(' ', $user->name)[0] ?? $user->name,
                'lastName' => explode(' ', $user->name, 2)[1] ?? '',
                'username' => $user->username,
                'email' => $user->email,
                'status' => $user->status,
                'role' => $user->getRoleNames()->first() ?? 'Viewer',
                'createdAt' => $user->created_at,
                'updatedAt' => $user->updated_at,
            ];
        });

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

        $user = User::create([
            'name' => trim($validated['firstName'] . ' ' . ($validated['lastName'] ?? '')),
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'status' => $validated['status'],
            'password_setup_required' => true, // New users need to setup their password
            'email_verified_at' => $validated['status'] === 'active' ? now() : null,
        ]);

        // Assign role
        $user->assignRole($validated['role']);

        return response()->json([
            'message' => 'User created successfully',
            'user' => [
                'id' => (string) $user->id,
                'firstName' => explode(' ', $user->name)[0] ?? $user->name,
                'lastName' => explode(' ', $user->name, 2)[1] ?? '',
                'username' => $user->username,
                'email' => $user->email,
                'status' => $user->status,
                'role' => $user->getRoleNames()->first() ?? 'Viewer',
                'createdAt' => $user->created_at,
                'updatedAt' => $user->updated_at,
            ],
        ], 201);
    }

    /**
     * Display the specified user
     */
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'id' => (string) $user->id,
            'firstName' => explode(' ', $user->name)[0] ?? $user->name,
            'lastName' => explode(' ', $user->name, 2)[1] ?? '',
            'username' => $user->username,
            'email' => $user->email,
            'status' => $user->status,
            'role' => $user->getRoleNames()->first() ?? 'viewer',
            'createdAt' => $user->created_at,
            'updatedAt' => $user->updated_at,
        ]);
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

        $updateData = [
            'name' => trim($validated['firstName'] . ' ' . ($validated['lastName'] ?? '')),
            'username' => $validated['username'],
            'email' => $validated['email'],
            'status' => $validated['status'],
        ];

        // Only update password if provided
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        // Update email verification based on status
        if ($validated['status'] === 'active' && !$user->email_verified_at) {
            $updateData['email_verified_at'] = now();
        } elseif ($validated['status'] !== 'active' && $user->email_verified_at) {
            $updateData['email_verified_at'] = null;
        }

        // Check if status is being changed to SUSPENDED (before updating)
        $wasSuspended = $user->status === User::STATUS_SUSPENDED;
        $willBeSuspended = $validated['status'] === User::STATUS_SUSPENDED;
        
        // If user is being suspended, revoke all their tokens (force logout) BEFORE updating status
        if (!$wasSuspended && $willBeSuspended) {
            $user->tokens()->delete();
            // Also clear remember_token to ensure complete logout
            $user->update(['remember_token' => null]);
        }
        
        $user->update($updateData);

        // Update role
        $user->syncRoles([$validated['role']]);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => [
                'id' => (string) $user->id,
                'firstName' => explode(' ', $user->name)[0] ?? $user->name,
                'lastName' => explode(' ', $user->name, 2)[1] ?? '',
                'username' => $user->username,
                'email' => $user->email,
                'status' => $user->status,
                'role' => $user->getRoleNames()->first() ?? 'Viewer',
                'createdAt' => $user->created_at,
                'updatedAt' => $user->updated_at,
            ],
        ]);
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user): JsonResponse
    {
        // Prevent deleting the last super admin
        if ($user->hasRole('Super Admin') && User::role('Super Admin')->count() <= 1) {
            return response()->json([
                'message' => 'Cannot delete the last Super Admin user',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
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

        $users = User::whereIn('id', $validated['user_ids'])->get();

        foreach ($users as $user) {
            $updateData = ['status' => $validated['status']];
            
            // Update email verification based on status
            if ($validated['status'] === 'active' && !$user->email_verified_at) {
                $updateData['email_verified_at'] = now();
            } elseif ($validated['status'] !== 'active' && $user->email_verified_at) {
                $updateData['email_verified_at'] = null;
            }

            $user->update($updateData);
        }

        return response()->json([
            'message' => 'Users updated successfully',
            'updated_count' => $users->count(),
        ]);
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

        $users = User::whereIn('id', $validated['user_ids'])->get();

        // Check if any of the users to delete are the last Super Admin
        $superAdmins = $users->filter(fn($user) => $user->hasRole('Super Admin'));
        if ($superAdmins->count() > 0 && User::role('Super Admin')->count() <= $superAdmins->count()) {
            return response()->json([
                'message' => 'Cannot delete the last Super Admin user(s)',
            ], 422);
        }

        $deletedCount = 0;
        foreach ($users as $user) {
            $user->delete();
            $deletedCount++;
        }

        return response()->json([
            'message' => 'Users deleted successfully',
            'deleted_count' => $deletedCount,
        ]);
    }

    /**
     * Get available roles
     */
    public function roles(): JsonResponse
    {
        $roles = Role::all()->map(function ($role) {
            return [
                'value' => $role->name,
                'label' => $role->name,
            ];
        });

        return response()->json($roles);
    }

    public function statuses(): JsonResponse
    {
        $statuses = [
            ['value' => '1', 'label' => 'Active'],
            ['value' => '2', 'label' => 'Inactive'],
            ['value' => '4', 'label' => 'Suspended'],
        ];

        return response()->json($statuses);
    }

}