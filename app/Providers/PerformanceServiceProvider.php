<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Blade;

class PerformanceServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Share common data with all views
        View::share('appName', config('app.name'));
        View::share('appUrl', config('app.url'));

        // Add performance-related Blade directives
        Blade::directive('preload', function ($expression) {
            return "<?php echo '<link rel=\"preload\" href=' . $expression . ' as=\"script\">'; ?>";
        });

        Blade::directive('prefetch', function ($expression) {
            return "<?php echo '<link rel=\"prefetch\" href=' . $expression . '>'; ?>";
        });

        // Optimize database queries
        if (config('performance.database.query_cache', true)) {
            $this->app->make('db')->enableQueryLog();
        }
    }
}
