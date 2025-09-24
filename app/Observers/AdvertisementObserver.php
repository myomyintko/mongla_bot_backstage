<?php

declare(strict_types=1);

namespace App\Observers;

use App\Jobs\ProcessAdvertisementDelivery;
use App\Models\Advertisement;
use Illuminate\Support\Facades\Log;

class AdvertisementObserver
{
    /**
     * Handle the Advertisement "created" event.
     */
    public function created(Advertisement $advertisement): void
    {
        Log::info('New advertisement created', [
            'ad_id' => $advertisement->id,
            'ad_title' => $advertisement->title,
            'status' => $advertisement->status,
            'start_date' => $advertisement->start_date,
            'end_date' => $advertisement->end_date,
        ]);
        
        // Note: Jobs are now managed manually or via scheduled commands
        // No automatic job creation to prevent job spam
    }

    /**
     * Handle the Advertisement "updated" event.
     */
    public function updated(Advertisement $advertisement): void
    {
        Log::info('Advertisement updated', [
            'ad_id' => $advertisement->id,
            'ad_title' => $advertisement->title,
            'status' => $advertisement->status,
            'start_date' => $advertisement->start_date,
            'end_date' => $advertisement->end_date,
            'frequency_cap_minutes' => $advertisement->frequency_cap_minutes,
        ]);
        
        // Check if critical fields that affect job scheduling were updated
        $criticalFields = ['status', 'start_date', 'end_date', 'frequency_cap_minutes'];
        $wasChanged = false;
        
        foreach ($criticalFields as $field) {
            if ($advertisement->wasChanged($field)) {
                $wasChanged = true;
                break;
            }
        }
        
        if ($wasChanged) {
            Log::info('Critical advertisement fields updated, clearing existing jobs', [
                'ad_id' => $advertisement->id,
                'changed_fields' => $advertisement->getChanges(),
            ]);
            
            // Clear existing jobs for this advertisement
            $this->clearExistingJobs($advertisement->id);
            
            // If advertisement is still running, reschedule with new settings
            if ($advertisement->isCurrentlyRunning()) {
                Log::info('Rescheduling advertisement delivery with updated settings', [
                    'ad_id' => $advertisement->id,
                    'frequency_cap_minutes' => $advertisement->frequency_cap_minutes,
                ]);
                
                ProcessAdvertisementDelivery::dispatch($advertisement)
                    ->onQueue('advertisements');
            }
        }
    }

    /**
     * Handle the Advertisement "deleted" event.
     */
    public function deleted(Advertisement $advertisement): void
    {
        Log::info('Advertisement deleted', [
            'ad_id' => $advertisement->id,
            'ad_title' => $advertisement->title,
        ]);
        
        // Clear existing jobs when advertisement is deleted (soft delete)
        $this->clearExistingJobs($advertisement->id);
    }

    /**
     * Handle the Advertisement "restored" event.
     */
    public function restored(Advertisement $advertisement): void
    {
        Log::info('Advertisement restored', [
            'ad_id' => $advertisement->id,
            'ad_title' => $advertisement->title,
        ]);
        
        // Note: Jobs are now managed manually or via scheduled commands
        // No automatic job creation to prevent job spam
    }

    /**
     * Handle the Advertisement "force deleted" event.
     */
    public function forceDeleted(Advertisement $advertisement): void
    {
        Log::info('Advertisement force deleted', [
            'ad_id' => $advertisement->id,
            'ad_title' => $advertisement->title,
        ]);
        
        // Clear existing jobs when advertisement is force deleted
        $this->clearExistingJobs($advertisement->id);
    }
    
    /**
     * Clear existing jobs for a specific advertisement
     */
    private function clearExistingJobs(int $advertisementId): void
    {
        try {
            // Get all advertisement delivery jobs and check each one manually
            $jobs = \Illuminate\Support\Facades\DB::table('jobs')
                ->where('queue', 'advertisements')
                ->where('payload', 'like', '%ProcessAdvertisementDelivery%')
                ->get();

            $deletedCount = 0;
            foreach ($jobs as $job) {
                $data = json_decode($job->payload, true);
                if (isset($data['data']['command'])) {
                    $command = $data['data']['command'];

                    // Check if this job contains the specific advertisement ID
                    if (preg_match('/"id";i:' . $advertisementId . ';/', $command)) {
                        \Illuminate\Support\Facades\DB::table('jobs')
                            ->where('id', $job->id)
                            ->delete();
                        $deletedCount++;
                    }
                }
            }

            Log::info('Cleared existing jobs for advertisement', [
                'ad_id' => $advertisementId,
                'deleted_jobs_count' => $deletedCount,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to clear existing jobs for advertisement', [
                'ad_id' => $advertisementId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
