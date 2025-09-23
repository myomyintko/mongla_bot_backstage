<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\View;


// Serve the React SPA for all other routes (excluding API routes)
Route::get('/{any}', function () {
    return View::make('app');
})->where('any', '^(?!api).*$')->name('spa');
