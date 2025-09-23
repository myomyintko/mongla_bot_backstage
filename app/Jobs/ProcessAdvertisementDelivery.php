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

class ProcessAdvertisementDelivery implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public $timeout = 600; // 10 minutes (increased for network issues)
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly Advertisement $advertisement
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(AdvertisementServiceInterface $advertisementService): void
    {
        try {
            Log::info('Processing advertisement delivery job', [
                'ad_id' => $this->advertisement->id,
                'ad_title' => $this->advertisement->title,
            ]);

            // Fetch fresh advertisement data to check current status
            $freshAdvertisement = Advertisement::find($this->advertisement->id);
            
            if (!$freshAdvertisement) {
                Log::warning('Advertisement not found, skipping delivery', [
                    'ad_id' => $this->advertisement->id,
                ]);
                return;
            }

            // Check if advertisement is still active and running
            if (! $freshAdvertisement->isCurrentlyRunning()) {
                Log::info('Advertisement is no longer running, skipping delivery', [
                    'ad_id' => $freshAdvertisement->id,
                    'status' => $freshAdvertisement->status,
                    'start_date' => $freshAdvertisement->start_date,
                    'end_date' => $freshAdvertisement->end_date,
                ]);
                return;
            }

            // Process the delivery (automatically uses chunked delivery for better performance)
            $result = $advertisementService->processAdvertisementDelivery($freshAdvertisement, 100);

            if ($result['success']) {
                Log::info('Advertisement delivery completed successfully', [
                    'ad_id' => $freshAdvertisement->id,
                    'delivered_count' => $result['delivered_count'] ?? 0,
                    'batches_created' => $result['batches_created'] ?? 0,
                ]);

                // Check if there's already a scheduled job for this advertisement to prevent duplicates
                $existingJob = \DB::table('jobs')
                    ->where('queue', 'advertisements')
                    ->where('payload', 'like', '%ProcessAdvertisementDelivery%')
                    ->where('payload', 'like', '%i:' . $freshAdvertisement->id . ';%')
                    ->where('available_at', '>', now()->timestamp)
                    ->first();

                if ($existingJob) {
                    Log::info('Job already scheduled for this advertisement, skipping duplicate scheduling', [
                        'ad_id' => $freshAdvertisement->id,
                        'existing_job_id' => $existingJob->id,
                    ]);
                } else {
                    // Only schedule next delivery if advertisements were actually sent
                    if (($result['delivered_count'] ?? 0) > 0) {
                        // Schedule next delivery based on frequency cap
                        $this->scheduleNextDelivery();
                    } else {
                        Log::info('No advertisements were sent, scheduling next delivery anyway', [
                            'ad_id' => $freshAdvertisement->id,
                        ]);
                        // Still schedule next delivery even if no users were eligible
                        // This ensures the job continues to run and check for eligible users
                        $this->scheduleNextDelivery();
                    }
                }
            } else {
                Log::error('Advertisement delivery failed', [
                    'ad_id' => $freshAdvertisement->id,
                    'error' => $result['error'] ?? 'Unknown error',
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Exception in advertisement delivery job', [
                'ad_id' => $this->advertisement->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Schedule the next delivery based on frequency cap
     */
    private function scheduleNextDelivery(): void
    {
        // Fetch fresh advertisement data to get the latest frequency cap
        $freshAdvertisement = Advertisement::find($this->advertisement->id);
        
        if (!$freshAdvertisement) {
            Log::warning('Advertisement not found when scheduling next delivery', [
                'ad_id' => $this->advertisement->id,
            ]);
            return;
        }
        
        $frequencyMinutes = $freshAdvertisement->frequency_cap_minutes ?? 1440; // Default 24 hours
        $nextDeliveryTime = now()->addMinutes($frequencyMinutes);

        // Check if next delivery would be after end date
        if ($freshAdvertisement->end_date && $nextDeliveryTime->gt($freshAdvertisement->end_date)) {
            Log::info('Advertisement end date reached, marking as expired and stopping deliveries', [
                'ad_id' => $freshAdvertisement->id,
                'end_date' => $freshAdvertisement->end_date,
            ]);

            // Update advertisement status to expired (2)
            try {
                $freshAdvertisement->update(['status' => 2]);
                Log::info('Advertisement automatically marked as expired', [
                    'ad_id' => $freshAdvertisement->id,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to mark advertisement as expired', [
                    'ad_id' => $freshAdvertisement->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return;
        }
        
        self::dispatch($freshAdvertisement)
            ->delay($nextDeliveryTime)
            ->onQueue('advertisements');

        Log::info('Next advertisement delivery scheduled', [
            'ad_id' => $freshAdvertisement->id,
            'next_delivery' => $nextDeliveryTime->format('Y-m-d H:i:s'),
            'frequency_minutes' => $frequencyMinutes,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Advertisement delivery job failed', [
            'ad_id' => $this->advertisement->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
