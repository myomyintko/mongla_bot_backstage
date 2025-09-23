<?php

declare(strict_types=1);

namespace App\Services\Store;

use App\Models\Store;
use App\Repositories\Store\StoreRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StoreService implements StoreServiceInterface
{
    public function __construct(
        private StoreRepositoryInterface $storeRepository
    ) {}

    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->storeRepository->getPaginated($filters, $perPage);
    }

    public function getById(int $id): ?Store
    {
        return $this->storeRepository->findById($id);
    }

    public function create(array $data): Store
    {
        return $this->storeRepository->create($data);
    }

    public function update(Store $store, array $data): Store
    {
        return $this->storeRepository->update($store, $data);
    }

    public function delete(Store $store): bool
    {
        return $this->storeRepository->delete($store);
    }

    public function bulkUpdate(array $ids, array $data): array
    {
        $updatedCount = $this->storeRepository->bulkUpdate($ids, $data);

        return [
            'message' => "Successfully updated {$updatedCount} stores",
            'updated_count' => $updatedCount
        ];
    }

    public function bulkDelete(array $ids): array
    {
        $deletedCount = $this->storeRepository->bulkDelete($ids);

        return [
            'message' => "Successfully deleted {$deletedCount} stores",
            'updated_count' => $deletedCount
        ];
    }

    public function getAllForSelect(): Collection
    {
        return $this->storeRepository->getAllForSelect();
    }

    public function importFromExcel(string $filePath): array
    {
        try {
            $spreadsheet = IOFactory::load($filePath);
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            $imported = 0;
            $errors = [];

            // Skip header row
            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];
                
                if (empty($row[0])) continue; // Skip empty rows

                try {
                    $storeData = [
                        'name' => $row[0] ?? '',
                        'address' => $row[1] ?? '',
                        'phone' => $row[2] ?? '',
                        'description' => $row[3] ?? '',
                        'status' => isset($row[4]) ? (int)$row[4] : 1,
                        'recommand' => isset($row[5]) ? (bool)$row[5] : false,
                    ];

                    $this->storeRepository->create($storeData);
                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Row " . ($i + 1) . ": " . $e->getMessage();
                }
            }

            return [
                'message' => "Successfully imported {$imported} stores",
                'imported_count' => $imported,
                'errors' => $errors
            ];
        } catch (\Exception $e) {
            return [
                'message' => 'Failed to import stores: ' . $e->getMessage(),
                'imported_count' => 0,
                'errors' => [$e->getMessage()]
            ];
        }
    }
}
