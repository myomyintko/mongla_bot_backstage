<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Store;
use App\Services\Store\StoreServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StoreController extends Controller
{
    public function __construct(
        private StoreServiceInterface $storeService
    ) {}
    /**
     * Display a listing of stores
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'status' => $request->get('status'),
            'recommand' => $request->boolean('recommand'),
            'menu_button_id' => $request->get('menu_button_id'),
            'search' => $request->get('search'),
        ];

        $perPage = (int) $request->get('per_page', 15);
        $stores = $this->storeService->getPaginated($filters, $perPage);

        return response()->json($stores);
    }

    /**
     * Store a newly created store
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'media_url' => 'nullable|string|max:500',
            'menu_urls' => 'nullable|array|max:10',
            'menu_urls.*' => 'string|max:500',
            'open_hour' => 'nullable|string|max:10',
            'close_hour' => 'nullable|string|max:10',
            'status' => 'nullable|integer|in:0,1',
            'address' => 'nullable|string|max:500',
            'recommand' => 'nullable|boolean',
            'sub_btns' => 'nullable|array',
            'menu_button_id' => 'nullable|exists:menu_buttons,id',
        ]);

        // Set default values
        $validated['status'] = $validated['status'] ?? 1;
        $validated['recommand'] = $validated['recommand'] ?? false;

        $store = $this->storeService->create($validated);

        return response()->json($store, 201);
    }

    /**
     * Display the specified store
     */
    public function show(Store $store): JsonResponse
    {
        return response()->json($store);
    }

    /**
     * Update the specified store
     */
    public function update(Request $request, Store $store): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'media_url' => 'nullable|string|max:500',
            'menu_urls' => 'nullable|array|max:10',
            'menu_urls.*' => 'string|max:500',
            'open_hour' => 'nullable|string|max:10',
            'close_hour' => 'nullable|string|max:10',
            'status' => 'nullable|integer|in:0,1',
            'address' => 'nullable|string|max:500',
            'recommand' => 'nullable|boolean',
            'sub_btns' => 'nullable|array',
            'menu_button_id' => 'nullable|exists:menu_buttons,id',
        ]);

        $store->update($validated);
        $store->load(['menuButton']);

        return response()->json($store);
    }

    /**
     * Remove the specified store
     */
    public function destroy(Store $store): JsonResponse
    {
        $store->delete();
        return response()->json(['message' => 'Store deleted successfully']);
    }

    /**
     * Bulk update stores
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:stores,id',
            'updates' => 'required|array',
            'updates.status' => 'nullable|integer|in:0,1',
            'updates.recommand' => 'nullable|boolean',
        ]);

        $updated = Store::whereIn('id', $validated['ids'])
            ->update($validated['updates']);

        return response()->json([
            'message' => "Successfully updated {$updated} stores",
            'updated_count' => $updated
        ]);
    }

    /**
     * Bulk delete stores
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:stores,id',
        ]);

        $deleted = Store::whereIn('id', $validated['ids'])->delete();

        return response()->json([
            'message' => "Successfully deleted {$deleted} stores",
            'deleted_count' => $deleted
        ]);
    }

    /**
     * Bulk import stores from Excel file
     */
    public function bulkImport(Request $request): JsonResponse
    {
        $validator = \Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $file = $request->file('file');
            $importedCount = 0;
            $errors = [];

            // Read Excel file
            $reader = IOFactory::createReader('Xlsx');
            $spreadsheet = $reader->load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            // Skip header row
            $dataRows = array_slice($rows, 1);

            foreach ($dataRows as $index => $row) {
                try {
                    // Map Excel columns to store data
                    $storeData = [
                        'name' => $row[0] ?? '',
                        'description' => $row[1] ?? null,
                        'media_url' => $row[2] ?? null, // This will be handled as filename
                        'address' => $row[3] ?? '',
                        'open_hour' => $row[4] ?? '09:00',
                        'close_hour' => $row[5] ?? '21:00',
                        'status' => $this->mapStatus($row[6] ?? 'Active'),
                        'recommand' => $this->mapRecommended($row[7] ?? 'No'),
                        'menu_button_id' => $row[8] ? (int)$row[8] : null,
                    ];

                    // Validate required fields
                    if (empty($storeData['name'])) {
                        throw new \Exception('Name is required');
                    }

                    // Handle media file upload if filename is provided
                    if (!empty($storeData['media_url'])) {
                        $mediaPath = $this->handleMediaFile($storeData['media_url']);
                        $storeData['media_url'] = $mediaPath;
                    }

                    // Create store
                    Store::create($storeData);
                    $importedCount++;

                } catch (\Exception $e) {
                    $errors[] = [
                        'row' => $index + 2, // +2 because we skip header and arrays are 0-indexed
                        'error' => $e->getMessage(),
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Successfully imported {$importedCount} stores",
                'imported_count' => $importedCount,
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Map status string to integer
     */
    private function mapStatus(string $status): int
    {
        return match (strtolower(trim($status))) {
            'active' => 1,
            'inactive' => 0,
            default => 1,
        };
    }

    /**
     * Map recommended string to boolean
     */
    private function mapRecommended(string $recommended): bool
    {
        return match (strtolower(trim($recommended))) {
            'yes', 'true', '1' => true,
            default => false,
        };
    }

    /**
     * Handle media file upload
     */
    private function handleMediaFile(string $filename): ?string
    {
        // For now, we'll just return the filename as the path
        // In a real implementation, you might want to:
        // 1. Check if the file exists in a specific directory
        // 2. Upload the file to the media library
        // 3. Return the proper file path
        
        // This is a placeholder implementation
        // You should implement proper file handling based on your requirements
        return $filename;
    }
}
