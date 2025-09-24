<?php

namespace App\Console\Commands;

use App\Jobs\ProcessAdvertisementDelivery;
use App\Models\Advertisement;
use Illuminate\Console\Command;

class StartAdvertisementDelivery extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ads:start-delivery {--ad-id= : Specific advertisement ID to start}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Start advertisement delivery for running advertisements';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $adId = $this->option('ad-id');
        
        if ($adId) {
            // Start specific advertisement
            $advertisement = Advertisement::find($adId);
            
            if (!$advertisement) {
                $this->error("Advertisement with ID {$adId} not found.");
                return 1;
            }
            
            if (!$advertisement->isCurrentlyRunning()) {
                $this->error("Advertisement {$adId} is not currently running.");
                return 1;
            }
            
            $this->info("Starting delivery for advertisement: {$advertisement->title}");
            ProcessAdvertisementDelivery::dispatch($advertisement)->onQueue('advertisements');
            $this->info("Job dispatched successfully!");
            
        } else {
            // Start all running advertisements
            $runningAds = Advertisement::where('status', 1)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->get();
            
            if ($runningAds->isEmpty()) {
                $this->info('No running advertisements found.');
                return 0;
            }
            
            $this->info("Found {$runningAds->count()} running advertisements:");
            
            foreach ($runningAds as $index => $ad) {
                $this->line("- ID {$ad->id}: {$ad->title} (Frequency: {$ad->frequency_cap_minutes} min)");
                
                // Check if job already exists for this advertisement
                $existingJob = \Illuminate\Support\Facades\DB::table('jobs')
                    ->where('queue', 'advertisements')
                    ->where('payload', 'like', '%ProcessAdvertisementDelivery%')
                    ->where('payload', 'like', '%s:2:"id";i:' . $ad->id . ';%')
                    ->first();
                
                if ($existingJob) {
                    $this->warn("  ⚠️  Job already exists for advertisement ID {$ad->id}, skipping...");
                } else {
                    // Schedule all advertisements to wait for their frequency cap before first send
                    $frequencyMinutes = $ad->frequency_cap_minutes ?? 60;
                    
                    // Stagger initial dispatch times to prevent simultaneous sending
                    // Each ad gets dispatched with a delay based on its frequency cap
                    $baseDelay = $frequencyMinutes * 60; // Base delay = full frequency cap
                    $staggerDelay = $index * 30; // Stagger by 30 seconds between ads
                    $totalDelay = $baseDelay + $staggerDelay;
                    
                    $dispatchTime = now()->addSeconds($totalDelay);
                    ProcessAdvertisementDelivery::dispatch($ad)
                        ->delay($dispatchTime)
                        ->onQueue('advertisements');
                    
                    $this->info("  📅 Scheduled for dispatch at: {$dispatchTime->format('H:i:s')} (delay: {$totalDelay}s = {$frequencyMinutes}min + {$staggerDelay}s stagger)");
                }
            }
            
            $this->info("All jobs dispatched successfully!");
        }
        
        return 0;
    }
}