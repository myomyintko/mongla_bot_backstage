<?php

namespace App\Providers;

use App\Repositories\Advertisement\AdvertisementRepository;
use App\Repositories\Advertisement\AdvertisementRepositoryInterface;
use App\Repositories\MediaLibrary\MediaLibraryRepository;
use App\Repositories\MediaLibrary\MediaLibraryRepositoryInterface;
use App\Repositories\MenuButton\MenuButtonRepository;
use App\Repositories\MenuButton\MenuButtonRepositoryInterface;
use App\Repositories\PinMessage\PinMessageRepository;
use App\Repositories\PinMessage\PinMessageRepositoryInterface;
use App\Repositories\Role\RoleRepository;
use App\Repositories\Role\RoleRepositoryInterface;
use App\Repositories\Store\StoreRepository;
use App\Repositories\Store\StoreRepositoryInterface;
use App\Repositories\TelegraphBot\TelegraphBotRepository;
use App\Repositories\TelegraphBot\TelegraphBotRepositoryInterface;
use App\Repositories\TelegraphChat\TelegraphChatRepository;
use App\Repositories\TelegraphChat\TelegraphChatRepositoryInterface;
use App\Repositories\User\UserRepository;
use App\Repositories\User\UserRepositoryInterface;
use App\Repositories\BotTemplate\BotTemplateRepository;
use App\Repositories\BotTemplate\BotTemplateRepositoryInterface;
use App\Services\Advertisement\AdvertisementService;
use App\Services\Advertisement\AdvertisementServiceInterface;
use App\Services\Auth\AuthService;
use App\Services\Auth\AuthServiceInterface;
use App\Services\MediaLibrary\MediaLibraryService;
use App\Services\MediaLibrary\MediaLibraryServiceInterface;
use App\Services\MenuButton\MenuButtonService;
use App\Services\MenuButton\MenuButtonServiceInterface;
use App\Services\PinMessage\PinMessageService;
use App\Services\PinMessage\PinMessageServiceInterface;
use App\Services\Profile\ProfileService;
use App\Services\Profile\ProfileServiceInterface;
use App\Services\Role\RoleService;
use App\Services\Role\RoleServiceInterface;
use App\Services\Store\StoreService;
use App\Services\Store\StoreServiceInterface;
use App\Services\TelegraphBot\TelegraphBotService;
use App\Services\TelegraphBot\TelegraphBotServiceInterface;
use App\Services\TwoFactor\TwoFactorService;
use App\Services\TwoFactor\TwoFactorServiceInterface;
use App\Services\User\UserService;
use App\Services\User\UserServiceInterface;
use App\Services\BotTemplate\BotTemplateService;
use App\Services\BotTemplate\BotTemplateServiceInterface;
use App\Models\Advertisement;
use App\Observers\AdvertisementObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Repository bindings
        $this->app->bind(
            TelegraphBotRepositoryInterface::class,
            TelegraphBotRepository::class
        );

        $this->app->bind(
            TelegraphChatRepositoryInterface::class,
            TelegraphChatRepository::class
        );

        $this->app->bind(
            UserRepositoryInterface::class,
            UserRepository::class
        );

        $this->app->bind(
            RoleRepositoryInterface::class,
            RoleRepository::class
        );

        $this->app->bind(
            AdvertisementRepositoryInterface::class,
            AdvertisementRepository::class
        );

        $this->app->bind(
            StoreRepositoryInterface::class,
            StoreRepository::class
        );

        $this->app->bind(
            MenuButtonRepositoryInterface::class,
            MenuButtonRepository::class
        );

        $this->app->bind(
            PinMessageRepositoryInterface::class,
            PinMessageRepository::class
        );

        $this->app->bind(
            MediaLibraryRepositoryInterface::class,
            MediaLibraryRepository::class
        );

        $this->app->bind(
            BotTemplateRepositoryInterface::class,
            BotTemplateRepository::class
        );

        // Service bindings
        $this->app->bind(
            TelegraphBotServiceInterface::class,
            TelegraphBotService::class
        );

        $this->app->bind(
            UserServiceInterface::class,
            UserService::class
        );

        $this->app->bind(
            RoleServiceInterface::class,
            RoleService::class
        );

        $this->app->bind(
            AdvertisementServiceInterface::class,
            AdvertisementService::class
        );

        $this->app->bind(
            StoreServiceInterface::class,
            StoreService::class
        );

        $this->app->bind(
            MenuButtonServiceInterface::class,
            MenuButtonService::class
        );

        $this->app->bind(
            PinMessageServiceInterface::class,
            PinMessageService::class
        );

        $this->app->bind(
            MediaLibraryServiceInterface::class,
            MediaLibraryService::class
        );

        $this->app->bind(
            ProfileServiceInterface::class,
            ProfileService::class
        );

        $this->app->bind(
            TwoFactorServiceInterface::class,
            TwoFactorService::class
        );

        $this->app->bind(
            AuthServiceInterface::class,
            AuthService::class
        );

        $this->app->bind(
            BotTemplateServiceInterface::class,
            BotTemplateService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers
        Advertisement::observe(AdvertisementObserver::class);
    }
}
