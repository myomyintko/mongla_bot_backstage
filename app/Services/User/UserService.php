<?php

declare(strict_types=1);

namespace App\Services\User;

use App\Models\User;
use App\Repositories\User\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class UserService implements UserServiceInterface
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->userRepository->getPaginated($filters, $perPage);
    }

    public function getById(int $id): ?User
    {
        return $this->userRepository->findById($id);
    }

    public function create(array $data): User
    {
        return $this->userRepository->create($data);
    }

    public function update(User $user, array $data): User
    {
        return $this->userRepository->update($user, $data);
    }

    public function delete(User $user): bool
    {
        // Validate deletion
        $validation = $this->validateUserDeletion($user);
        if (!$validation['valid']) {
            throw new \Exception($validation['message']);
        }

        return $this->userRepository->delete($user);
    }

    public function bulkUpdate(array $userIds, array $data): array
    {
        $updatedCount = $this->userRepository->bulkUpdate($userIds, $data);

        return [
            'message' => 'Users updated successfully',
            'updated_count' => $updatedCount,
        ];
    }

    public function bulkDelete(array $userIds): array
    {
        // Validate bulk deletion
        $validation = $this->validateBulkUserDeletion($userIds);
        if (!$validation['valid']) {
            throw new \Exception($validation['message']);
        }

        $deletedCount = $this->userRepository->bulkDelete($userIds);

        return [
            'message' => 'Users deleted successfully',
            'deleted_count' => $deletedCount,
        ];
    }

    public function getRoles(): \Illuminate\Support\Collection
    {
        return $this->userRepository->getAllRoles();
    }

    public function getStatuses(): array
    {
        return [
            ['value' => '1', 'label' => 'Active'],
            ['value' => '2', 'label' => 'Inactive'],
            ['value' => '4', 'label' => 'Suspended'],
        ];
    }

    public function validateUserDeletion(User $user): array
    {
        if ($this->userRepository->isLastSuperAdmin($user)) {
            return [
                'valid' => false,
                'message' => 'Cannot delete the last Super Admin user',
            ];
        }

        return [
            'valid' => true,
            'message' => 'User can be deleted',
        ];
    }

    public function validateBulkUserDeletion(array $userIds): array
    {
        $users = $this->userRepository->getByIds($userIds);

        // Check if any of the users to delete are the last Super Admin
        $superAdmins = $users->filter(fn($user) => $user->hasRole('Super Admin'));
        if ($superAdmins->count() > 0 && $this->userRepository->getSuperAdminCount() <= $superAdmins->count()) {
            return [
                'valid' => false,
                'message' => 'Cannot delete the last Super Admin user(s)',
            ];
        }

        return [
            'valid' => true,
            'message' => 'Users can be deleted',
        ];
    }

    /**
     * Get the repository instance (for transformation methods)
     */
    public function getUserRepository(): UserRepositoryInterface
    {
        return $this->userRepository;
    }
}
