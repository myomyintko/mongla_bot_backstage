<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\AdvertisementController;
use App\Http\Controllers\PinMessageController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
});

// Media upload routes
Route::middleware('auth:sanctum')->prefix('media')->group(function () {
    Route::post('/upload', [MediaController::class, 'upload']);
    Route::delete('/delete', [MediaController::class, 'delete']);
    Route::get('/info', [MediaController::class, 'info']);
});

// Menu Buttons routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('menu-buttons', \App\Http\Controllers\MenuButtonController::class);
    Route::get('/menu-buttons-hierarchy', [\App\Http\Controllers\MenuButtonController::class, 'hierarchy']);
    Route::post('/menu-buttons/bulk-update', [\App\Http\Controllers\MenuButtonController::class, 'bulkUpdate']);
    Route::post('/menu-buttons/bulk-delete', [\App\Http\Controllers\MenuButtonController::class, 'bulkDelete']);
});

// Stores routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('stores', StoreController::class);
    Route::post('/stores/bulk-update', [StoreController::class, 'bulkUpdate']);
    Route::post('/stores/bulk-delete', [StoreController::class, 'bulkDelete']);
});

// Advertisements routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('advertisements', AdvertisementController::class);
    Route::post('/advertisements/bulk-update', [AdvertisementController::class, 'bulkUpdate']);
    Route::post('/advertisements/bulk-delete', [AdvertisementController::class, 'bulkDelete']);
});

// Pin Messages routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('pin-messages', PinMessageController::class);
    Route::post('/pin-messages/bulk-update', [PinMessageController::class, 'bulkUpdate']);
    Route::post('/pin-messages/bulk-delete', [PinMessageController::class, 'bulkDelete']);
});
