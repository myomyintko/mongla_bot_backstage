<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Advertisement;
use App\Services\Advertisement\AdvertisementServiceInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAdvertisementBatch implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public $timeout = 300; // 5 minutes per batch
    public $tries = 3;
    public $maxExceptions = 5;

    public function __construct(
        private readonly Advertisement $advertisement,
        private readonly array $userIds,
        private readonly int $batchNumber,
        private readonly int $totalBatches
    ) {
    }

    public function handle(AdvertisementServiceInterface $advertisementService): void
    {
        try {
            Log::info('Processing advertisement batch', [
                'ad_id' => $this->advertisement->id,
                'batch_number' => $this->batchNumber,
                'total_batches' => $this->totalBatches,
                'user_count' => count($this->userIds),
                'user_ids' => array_slice($this->userIds, 0, 5), // Log first 5 for debugging
            ]);

            if (!$this->advertisement->isCurrentlyRunning()) {
                Log::info('Advertisement is no longer running, skipping batch', [
                    'ad_id' => $this->advertisement->id,
                    'batch_number' => $this->batchNumber,
                ]);
                return;
            }

            $deliveredCount = 0;
            $failedCount = 0;

            // Process users in this batch
            foreach ($this->userIds as $userId) {
                try {
                    $result = $advertisementService->sendAdvertisementToUserPrivate($this->advertisement, $userId);
                    
                    if ($result['success']) {
                        $deliveredCount++;
                    } else {
                        $failedCount++;
                        
                        // Log only first few failures to avoid spam
                        if ($failedCount <= 3) {
                            Log::warning('Failed to send advertisement in batch', [
                                'ad_id' => $this->advertisement->id,
                                'user_id' => $userId,
                                'batch_number' => $this->batchNumber,
                                'error' => $result['message'] ?? 'Unknown error',
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    $failedCount++;
                    
                    if ($failedCount <= 3) {
                        Log::error('Exception in advertisement batch', [
                            'ad_id' => $this->advertisement->id,
                            'user_id' => $userId,
                            'batch_number' => $this->batchNumber,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            }

            Log::info('Advertisement batch completed', [
                'ad_id' => $this->advertisement->id,
                'batch_number' => $this->batchNumber,
                'total_batches' => $this->totalBatches,
                'delivered_count' => $deliveredCount,
                'failed_count' => $failedCount,
                'total_users_in_batch' => count($this->userIds),
            ]);

        } catch (\Exception $e) {
            Log::error('Exception in advertisement batch job', [
                'ad_id' => $this->advertisement->id,
                'batch_number' => $this->batchNumber,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Advertisement batch job failed', [
            'ad_id' => $this->advertisement->id,
            'batch_number' => $this->batchNumber,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
