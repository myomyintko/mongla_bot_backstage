<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Advertisement;
use App\Services\Advertisement\AdvertisementServiceInterface;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class UpdateExpiredAdvertisements extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'advertisements:update-expired';

    /**
     * The console command description.
     */
    protected $description = 'Update advertisements that have passed their end_date to expired status';

    public function __construct(
        private AdvertisementServiceInterface $advertisementService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking for expired advertisements...');

        try {
            // Find active advertisements that have passed their end_date
            $expiredAdvertisements = Advertisement::where('status', 1)
                ->whereNotNull('end_date')
                ->where('end_date', '<', now())
                ->get();

            if ($expiredAdvertisements->isEmpty()) {
                $this->info('No expired advertisements found.');
                return self::SUCCESS;
            }

            $updatedCount = 0;

            foreach ($expiredAdvertisements as $advertisement) {
                try {
                    // Update to expired status (2) and cancel jobs
                    $this->advertisementService->update($advertisement, [
                        'status' => 2
                    ]);

                    $updatedCount++;

                    $this->line("Updated advertisement '{$advertisement->title}' (ID: {$advertisement->id}) to expired status");

                    Log::info('Advertisement automatically expired', [
                        'ad_id' => $advertisement->id,
                        'title' => $advertisement->title,
                        'end_date' => $advertisement->end_date,
                    ]);

                } catch (\Exception $e) {
                    $this->error("Failed to update advertisement '{$advertisement->title}' (ID: {$advertisement->id}): {$e->getMessage()}");

                    Log::error('Failed to expire advertisement', [
                        'ad_id' => $advertisement->id,
                        'title' => $advertisement->title,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $this->info("Successfully updated {$updatedCount} expired advertisements.");

            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Error processing expired advertisements: ' . $e->getMessage());

            Log::error('Error in update expired advertisements command', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return self::FAILURE;
        }
    }
}