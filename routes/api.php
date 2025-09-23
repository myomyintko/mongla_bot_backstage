<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\AdvertisementController;
use App\Http\Controllers\PinMessageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MediaLibraryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TwoFactorController;
use App\Http\Controllers\TelegraphBotController;
use App\Http\Controllers\Admin\BotTemplateController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;

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
    Route::post('/verify-2fa', [AuthController::class, 'verifyTwoFactor']);
    Route::post('/setup-password', [AuthController::class, 'setupPassword'])->middleware('auth:sanctum');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
});

// Two-Factor Authentication routes
Route::middleware('auth:sanctum')->prefix('two-factor')->group(function () {
    Route::get('/status', [TwoFactorController::class, 'status']);
    Route::post('/generate-secret', [TwoFactorController::class, 'generateSecret']);
    Route::post('/enable', [TwoFactorController::class, 'enable']);
    Route::post('/disable', [TwoFactorController::class, 'disable']);
    Route::post('/verify', [TwoFactorController::class, 'verify']);
    Route::post('/verify-recovery-code', [TwoFactorController::class, 'verifyRecoveryCode']);
    Route::post('/regenerate-recovery-codes', [TwoFactorController::class, 'regenerateRecoveryCodes']);
});

// Profile routes
Route::middleware('auth:sanctum')->prefix('profile')->group(function () {
    Route::get('/', [ProfileController::class, 'show']);
    Route::put('/', [ProfileController::class, 'update']);
    Route::put('/avatar', [ProfileController::class, 'updateAvatar']);
    Route::put('/password', [ProfileController::class, 'updatePassword']);
});

// Menu Buttons routes
Route::middleware(['auth:sanctum', 'permission:menu-buttons.view'])->group(function () {
    Route::get('/menu-buttons', [\App\Http\Controllers\MenuButtonController::class, 'index']);
    Route::get('/menu-buttons/{menuButton}', [\App\Http\Controllers\MenuButtonController::class, 'show']);
    Route::get('/menu-buttons-hierarchy', [\App\Http\Controllers\MenuButtonController::class, 'hierarchy']);
    
    Route::post('/menu-buttons', [\App\Http\Controllers\MenuButtonController::class, 'store'])->middleware('permission:menu-buttons.create');
    Route::put('/menu-buttons/{menuButton}', [\App\Http\Controllers\MenuButtonController::class, 'update'])->middleware('permission:menu-buttons.edit');
    Route::delete('/menu-buttons/{menuButton}', [\App\Http\Controllers\MenuButtonController::class, 'destroy'])->middleware('permission:menu-buttons.delete');
    Route::post('/menu-buttons/bulk-update', [\App\Http\Controllers\MenuButtonController::class, 'bulkUpdate'])->middleware('permission:menu-buttons.edit');
    Route::post('/menu-buttons/bulk-delete', [\App\Http\Controllers\MenuButtonController::class, 'bulkDelete'])->middleware('permission:menu-buttons.delete');
});

// Stores routes
Route::middleware(['auth:sanctum', 'permission:stores.view'])->group(function () {
    Route::get('/stores', [StoreController::class, 'index']);

    // Dashboard routes MUST come before {store} parameter route
    Route::get('/stores/stats', [StoreController::class, 'stats']);
    Route::get('/stores/top-performing', [StoreController::class, 'topPerforming']);
    Route::get('/stores/status-breakdown', [StoreController::class, 'statusBreakdown']);
    Route::get('/stores/recent-activity', [StoreController::class, 'recentActivity']);

    Route::get('/stores/{store}', [StoreController::class, 'show']);

    Route::post('/stores', [StoreController::class, 'store'])->middleware('permission:stores.create');
    Route::put('/stores/{store}', [StoreController::class, 'update'])->middleware('permission:stores.edit');
    Route::delete('/stores/{store}', [StoreController::class, 'destroy'])->middleware('permission:stores.delete');
    Route::post('/stores/bulk-update', [StoreController::class, 'bulkUpdate'])->middleware('permission:stores.edit');
    Route::post('/stores/bulk-delete', [StoreController::class, 'bulkDelete'])->middleware('permission:stores.delete');
    Route::post('/stores/bulk-import', [StoreController::class, 'bulkImport'])->middleware('permission:stores.create');
});

// Advertisements routes
Route::middleware(['auth:sanctum', 'permission:advertisements.view'])->group(function () {
    Route::get('/advertisements', [AdvertisementController::class, 'index']);

    // Dashboard routes MUST come before {advertisement} parameter route
    Route::get('/advertisements/stats', [AdvertisementController::class, 'stats']);
    Route::get('/advertisements/top-performing', [AdvertisementController::class, 'topPerforming']);
    Route::get('/advertisements/status-breakdown', [AdvertisementController::class, 'statusBreakdown']);
    Route::get('/advertisements/recent-activity', [AdvertisementController::class, 'recentActivity']);
    Route::get('/advertisements/metrics', [AdvertisementController::class, 'metrics']);
    Route::get('/advertisements/upcoming', [AdvertisementController::class, 'upcoming']);

    Route::get('/advertisements/{advertisement}', [AdvertisementController::class, 'show']);

    Route::post('/advertisements', [AdvertisementController::class, 'store'])->middleware('permission:advertisements.create');
    Route::put('/advertisements/{advertisement}', [AdvertisementController::class, 'update'])->middleware('permission:advertisements.edit');
    Route::delete('/advertisements/{advertisement}', [AdvertisementController::class, 'destroy'])->middleware('permission:advertisements.delete');
    Route::post('/advertisements/bulk-update', [AdvertisementController::class, 'bulkUpdate'])->middleware('permission:advertisements.edit');
    Route::post('/advertisements/bulk-delete', [AdvertisementController::class, 'bulkDelete'])->middleware('permission:advertisements.delete');
    Route::post('/advertisements/{advertisement}/pause', [AdvertisementController::class, 'pause'])->middleware('permission:advertisements.edit');
    Route::post('/advertisements/{advertisement}/resume', [AdvertisementController::class, 'resume'])->middleware('permission:advertisements.edit');
    Route::post('/advertisements/bulk-pause-all', [AdvertisementController::class, 'bulkPauseAll'])->middleware('permission:advertisements.edit');
    Route::post('/advertisements/bulk-resume-all', [AdvertisementController::class, 'bulkResumeAll'])->middleware('permission:advertisements.edit');
});

// Pin Messages routes
Route::middleware(['auth:sanctum', 'permission:pin-messages.view'])->group(function () {
    Route::get('/pin-messages', [PinMessageController::class, 'index']);
    Route::get('/pin-messages/{pinMessage}', [PinMessageController::class, 'show']);
    
    Route::post('/pin-messages', [PinMessageController::class, 'store'])->middleware('permission:pin-messages.create');
    Route::put('/pin-messages/{pinMessage}', [PinMessageController::class, 'update'])->middleware('permission:pin-messages.edit');
    Route::delete('/pin-messages/{pinMessage}', [PinMessageController::class, 'destroy'])->middleware('permission:pin-messages.delete');
    Route::post('/pin-messages/bulk-update', [PinMessageController::class, 'bulkUpdate'])->middleware('permission:pin-messages.edit');
    Route::post('/pin-messages/bulk-delete', [PinMessageController::class, 'bulkDelete'])->middleware('permission:pin-messages.delete');
});

// Media Library routes
Route::middleware(['auth:sanctum', 'permission:media.view'])->group(function () {
    Route::get('/media-library', [MediaLibraryController::class, 'index']);
    Route::get('/media-library/{mediaLibrary}', [MediaLibraryController::class, 'show']);
    
    Route::post('/media-library', [MediaLibraryController::class, 'store'])->middleware('permission:media.upload');
    Route::put('/media-library/{mediaLibrary}', [MediaLibraryController::class, 'update'])->middleware('permission:media.upload');
    Route::delete('/media-library/{mediaLibrary}', [MediaLibraryController::class, 'destroy'])->middleware('permission:media.delete');
    Route::post('/media-library/bulk-delete', [MediaLibraryController::class, 'bulkDelete'])->middleware('permission:media.delete');
});

// Users routes
Route::middleware(['auth:sanctum', 'permission:users.view'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::get('/users/roles/available', [UserController::class, 'roles']);
    Route::get('/users/statuses/available', [UserController::class, 'statuses']);
    
    Route::post('/users', [UserController::class, 'store'])->middleware('permission:users.create');
    Route::put('/users/{user}', [UserController::class, 'update'])->middleware('permission:users.edit');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('permission:users.delete');
    Route::post('/users/bulk-update', [UserController::class, 'bulkUpdate'])->middleware('permission:users.edit');
    Route::post('/users/bulk-delete', [UserController::class, 'bulkDelete'])->middleware('permission:users.delete');
});

// Roles routes
Route::middleware(['auth:sanctum', 'permission:roles.view'])->group(function () {
    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/roles/{role}', [RoleController::class, 'show']);
    Route::get('/roles/permissions/available', [RoleController::class, 'permissions']);
    
    Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:roles.create');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->middleware('permission:roles.edit');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:roles.delete');
});

// Telegraph Bot Management Routes (Single Bot Configuration)
Route::middleware(['auth:sanctum', 'permission:telegraph.view'])->group(function () {
    Route::get('/telegraph/bot', [TelegraphBotController::class, 'index']);
    Route::get('/telegraph/bot/info', [TelegraphBotController::class, 'getBotInfo']);
    Route::post('/telegraph/bot/register-webhook', [TelegraphBotController::class, 'registerWebhook']);
    Route::post('/telegraph/bot/unregister-webhook', [TelegraphBotController::class, 'unregisterWebhook']);
    Route::post('/telegraph/bot/send-test-message', [TelegraphBotController::class, 'sendTestMessage']);
    
    // Webhook Info Route (read-only from .env)
    Route::get('/telegraph/bot/webhook-domain', [TelegraphBotController::class, 'getWebhookDomain']);
    Route::get('/telegraph/bot/webhook-info', [TelegraphBotController::class, 'getWebhookInfo']);
});

// Bot Template Management Routes
Route::middleware(['auth:sanctum', 'permission:bot-templates.view'])->group(function () {
    Route::get('/bot-templates', [BotTemplateController::class, 'index']);
    Route::get('/bot-templates/{id}', [BotTemplateController::class, 'show']);
    Route::post('/bot-templates/preview', [BotTemplateController::class, 'preview']);

    Route::post('/bot-templates', [BotTemplateController::class, 'store'])->middleware('permission:bot-templates.create');
    Route::put('/bot-templates/{id}', [BotTemplateController::class, 'update'])->middleware('permission:bot-templates.edit');
    Route::delete('/bot-templates/{id}', [BotTemplateController::class, 'destroy'])->middleware('permission:bot-templates.delete');
    Route::post('/bot-templates/{id}/activate', [BotTemplateController::class, 'activate'])->middleware('permission:bot-templates.edit');
    Route::post('/bot-templates/{id}/deactivate', [BotTemplateController::class, 'deactivate'])->middleware('permission:bot-templates.edit');
});

// Customer Management Routes (Telegram Users)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/stats', [CustomerController::class, 'stats']);
    Route::get('/customers/recent', [CustomerController::class, 'recent']);
});

// Dashboard Statistics Routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Overview dashboard
    Route::get('/dashboard/overview', [DashboardController::class, 'overview']);
    Route::get('/dashboard/monthly-revenue', [DashboardController::class, 'monthlyRevenue']);
    Route::get('/dashboard/recent-sales', [DashboardController::class, 'recentSales']);
});

