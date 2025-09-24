<?php

declare(strict_types=1);

namespace App\Repositories\User;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserRepository implements UserRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = User::with(['roles']);

        // Filter by status if provided
        if (!empty($filters['status']) && is_array($filters['status'])) {
            $query->whereIn('status', $filters['status']);
        }

        // Filter by role if provided
        if (!empty($filters['role']) && is_array($filters['role'])) {
            $query->whereHas('roles', function ($q) use ($filters) {
                $q->whereIn('name', $filters['role']);
            });
        }

        // Search by username, name, or email
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', '%' . $search . '%')
                  ->orWhere('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        // Sort by created_at desc by default
        $query->orderBy('created_at', 'desc');

        $users = $query->paginate($perPage);

        // Transform the response to match frontend expectations
        $users->getCollection()->transform(function ($user) {
            return $this->transformUserData($user);
        });

        return $users;
    }

    public function findById(int $id): ?User
    {
        return User::with(['roles'])->find($id);
    }

    public function create(array $data): User
    {
        $userData = [
            'name' => trim($data['firstName'] . ' ' . ($data['lastName'] ?? '')),
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'status' => $data['status'],
            'password_setup_required' => true,
            'email_verified_at' => $data['status'] === 'active' ? now() : null,
        ];

        $user = User::create($userData);

        // Assign role
        if (!empty($data['role'])) {
            $user->assignRole($data['role']);
        }

        return $user->load('roles');
    }

    public function update(User $user, array $data): User
    {
        $updateData = [];
        
        // Only update fields that are provided
        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }
        
        if (isset($data['username'])) {
            $updateData['username'] = $data['username'];
        }
        
        if (isset($data['email'])) {
            $updateData['email'] = $data['email'];
        }
        
        if (isset($data['status'])) {
            $updateData['status'] = $data['status'];
        }

        // Only update password if provided
        if (!empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }
        
        // If no fields to update, return the user as is
        if (empty($updateData)) {
            return $user;
        }

        // Update email verification based on status
        if (isset($data['status'])) {
            if ($data['status'] === 'active' && !$user->email_verified_at) {
                $updateData['email_verified_at'] = now();
            } elseif ($data['status'] !== 'active' && $user->email_verified_at) {
                $updateData['email_verified_at'] = null;
            }
        }

        // Check if status is being changed to SUSPENDED (before updating)
        $wasSuspended = $user->status === User::STATUS_SUSPENDED;
        $willBeSuspended = isset($data['status']) && $data['status'] === User::STATUS_SUSPENDED;
        
        // If user is being suspended, revoke all their tokens (force logout) BEFORE updating status
        if (!$wasSuspended && $willBeSuspended) {
            $user->tokens()->delete();
            // Also clear remember_token to ensure complete logout
            $user->update(['remember_token' => null]);
        }
        
        $user->update($updateData);

        // Update role
        if (!empty($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        return $user->fresh(['roles']);
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }

    public function bulkUpdate(array $userIds, array $data): int
    {
        $users = User::whereIn('id', $userIds)->get();
        $updatedCount = 0;

        foreach ($users as $user) {
            $updateData = ['status' => $data['status']];
            
            // Update email verification based on status
            if ($data['status'] === 'active' && !$user->email_verified_at) {
                $updateData['email_verified_at'] = now();
            } elseif ($data['status'] !== 'active' && $user->email_verified_at) {
                $updateData['email_verified_at'] = null;
            }

            $user->update($updateData);
            $updatedCount++;
        }

        return $updatedCount;
    }

    public function bulkDelete(array $userIds): int
    {
        $users = User::whereIn('id', $userIds)->get();
        $deletedCount = 0;

        foreach ($users as $user) {
            $user->delete();
            $deletedCount++;
        }

        return $deletedCount;
    }

    public function getByIds(array $ids): Collection
    {
        return User::whereIn('id', $ids)->get();
    }

    public function isLastSuperAdmin(User $user): bool
    {
        return $user->hasRole('Super Admin') && $this->getSuperAdminCount() <= 1;
    }

    public function getSuperAdminCount(): int
    {
        return User::role('Super Admin')->count();
    }

    public function getAllRoles(): \Illuminate\Support\Collection
    {
        return Role::all()->map(function ($role) {
            return [
                'value' => $role->name,
                'label' => $role->name,
            ];
        });
    }

    public function transformUserData(User $user): array
    {
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
    }

    public function transformUsersCollection(Collection $users): Collection
    {
        return $users->map(function ($user) {
            return $this->transformUserData($user);
        });
    }
}
