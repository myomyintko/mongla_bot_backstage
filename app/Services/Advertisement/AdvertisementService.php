<?php

declare(strict_types=1);

namespace App\Services\Advertisement;

use App\Jobs\ProcessAdvertisementBatch;
use App\Jobs\ProcessAdvertisementDelivery;
use App\Jobs\SendAdvertisementJob;
use App\Models\Advertisement;
use App\Repositories\Advertisement\AdvertisementRepositoryInterface;
use App\Repositories\TelegraphChat\TelegraphChatRepositoryInterface;
use App\Services\TelegraphBot\TelegraphBotServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use DefStudio\Telegraph\Keyboard\Keyboard;
use DefStudio\Telegraph\Keyboard\Button;

class AdvertisementService implements AdvertisementServiceInterface
{
    public function __construct(
        private AdvertisementRepositoryInterface $advertisementRepository,
        private TelegraphBotServiceInterface $telegraphBotService,
        private TelegraphChatRepositoryInterface $telegraphChatRepository
    ) {
    }

    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->advertisementRepository->getPaginated($filters, $perPage);
    }

    public function getById(int $id): ?Advertisement
    {
        return $this->advertisementRepository->findById($id);
    }

    public function create(array $data): Advertisement
    {
        $advertisement = $this->advertisementRepository->create($data);

        // Schedule the first advertisement delivery if it's active and has valid dates
        $this->scheduleInitialDelivery($advertisement);

        return $advertisement;
    }

    public function update(Advertisement $advertisement, array $data): Advertisement
    {
        $oldStatus = $advertisement->status;
        $oldFrequencyCapMinutes = $advertisement->frequency_cap_minutes;
        $oldStartDate = $advertisement->start_date;
        $oldEndDate = $advertisement->end_date;

        $updatedAdvertisement = $this->advertisementRepository->update($advertisement, $data);

        // Check if scheduling parameters have changed for an active advertisement
        $schedulingChanged = $this->hasSchedulingParametersChanged(
            $advertisement,
            $updatedAdvertisement,
            $oldFrequencyCapMinutes,
            $oldStartDate,
            $oldEndDate
        );

        if ($schedulingChanged) {
            Log::info('Advertisement scheduling parameters changed', [
                'ad_id' => $updatedAdvertisement->id,
                'status' => $updatedAdvertisement->status,
                'old_frequency_cap' => $oldFrequencyCapMinutes,
                'new_frequency_cap' => $updatedAdvertisement->frequency_cap_minutes,
                'old_start_date' => $oldStartDate,
                'new_start_date' => $updatedAdvertisement->start_date,
                'old_end_date' => $oldEndDate,
                'new_end_date' => $updatedAdvertisement->end_date,
            ]);

            // Always cancel existing jobs when scheduling parameters change
            $this->cancelExistingJobs($updatedAdvertisement->id);

            // Only reschedule if advertisement is active
            if ($updatedAdvertisement->status === 1) {
                Log::info('Advertisement is active, rescheduling delivery', [
                    'ad_id' => $updatedAdvertisement->id,
                ]);
                $this->scheduleInitialDelivery($updatedAdvertisement);
            } else {
                Log::info('Advertisement is inactive, skipping job scheduling', [
                    'ad_id' => $updatedAdvertisement->id,
                ]);
            }
        }
        // If advertisement was just activated, schedule initial delivery
        elseif ($oldStatus !== 1 && $updatedAdvertisement->status === 1) {
            $this->scheduleInitialDelivery($updatedAdvertisement);
        }
        // If advertisement was deactivated, cancel existing jobs
        elseif ($oldStatus === 1 && $updatedAdvertisement->status !== 1) {
            Log::info('Advertisement deactivated, canceling existing jobs', [
                'ad_id' => $updatedAdvertisement->id,
            ]);
            $this->cancelExistingJobs($updatedAdvertisement->id);
        }

        return $updatedAdvertisement;
    }

    public function delete(Advertisement $advertisement): bool
    {
        // Cancel any existing scheduled jobs before deleting
        $this->cancelExistingJobs($advertisement->id);

        return $this->advertisementRepository->delete($advertisement);
    }

    public function bulkUpdate(array $ids, array $data): array
    {
        $updatedCount = $this->advertisementRepository->bulkUpdate($ids, $data);

        return [
            'message' => "Successfully updated {$updatedCount} advertisements",
            'updated_count' => $updatedCount
        ];
    }

    public function bulkDelete(array $ids): array
    {
        // Cancel jobs for all advertisements being deleted
        foreach ($ids as $id) {
            $this->cancelExistingJobs($id);
        }

        $deletedCount = $this->advertisementRepository->bulkDelete($ids);

        return [
            'message' => "Successfully deleted {$deletedCount} advertisements",
            'updated_count' => $deletedCount
        ];
    }

    public function getAdvertisementsReadyToSend(): array
    {
        try {
            $advertisements = $this->advertisementRepository->getReadyToSend();

            return [
                'success' => true,
                'data' => $advertisements->toArray(),
                'count' => $advertisements->count()
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get advertisements ready to send', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get advertisements: ' . $e->getMessage()
            ];
        }
    }




    public function recordAdvertisementSend(int $advertisementId, int $userId): void
    {
        try {
            $this->advertisementRepository->recordSend($advertisementId, $userId);
        } catch (\Exception $e) {
            Log::error('Failed to record advertisement send', [
                'advertisement_id' => $advertisementId,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send advertisement via Telegram
     */
    private function sendAdvertisementViaTelegram(Advertisement $advertisement, int $userId): array
    {
        try {
            // Build advertisement message
            $message = $this->buildAdvertisementMessage($advertisement, $userId);

            // For now, we'll use a simple approach
            // In a real implementation, you'd use the TelegraphBotService to send to specific users
            // This is a placeholder - you'll need to implement the actual Telegram sending logic

            Log::info('Advertisement sent via Telegram', [
                'advertisement_id' => $advertisement->id,
                'user_id' => $userId,
                'message' => $message
            ]);

            return [
                'success' => true,
                'message' => 'Advertisement sent successfully'
            ];

        } catch (\Exception $e) {
            Log::error('Failed to send advertisement via Telegram', [
                'advertisement_id' => $advertisement->id,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Build advertisement message text using bot template
     */
    private function buildAdvertisementMessage(Advertisement $advertisement, int $userId = null): string
    {
        Log::info('=== buildAdvertisementMessage called ===', [
            'ad_id' => $advertisement->id,
            'user_id' => $userId
        ]);

        // Get the advertisement template
        $template = \App\Models\BotTemplate::getDefaultTemplate('advertisement');

        Log::info('Building advertisement message', [
            'ad_id' => $advertisement->id,
            'user_id' => $userId,
            'template_found' => $template ? true : false,
            'template_id' => $template ? $template->id : null
        ]);

        if (!$template) {
            // Fallback to simple message if no template
            $message = "📢 *{$advertisement->title}*\n\n";

            if ($advertisement->description) {
                $message .= "{$advertisement->description}\n\n";
            }

            if ($advertisement->store) {
                $message .= "🏪 *Store:* {$advertisement->store->name}\n";
            }

            $message .= "\n_Advertisement_";

            return $message;
        }

        // Get user information if userId is provided
        $userVariables = [];
        if ($userId) {
            $userVariables = $this->getUserVariablesForAdvertisement($userId);
            Log::info('User variables for advertisement message', [
                'ad_id' => $advertisement->id,
                'user_id' => $userId,
                'user_variables' => $userVariables
            ]);
        }

        // Add advertisement-specific variables
        $variables = array_merge($userVariables, [
            'adTitle' => $advertisement->title,
            'adDescription' => $advertisement->description ?? '',
            'currentTime' => now()->format('g:i A'),
            'currentDate' => now()->format('Y-m-d'),
        ]);

        // Add store-specific variables if store exists
        if ($advertisement->store) {
            $store = $advertisement->store;
            $variables = array_merge($variables, [
                'storeName' => $store->name,
                'storeDescription' => $store->description ?? '',
                'storeAddress' => $store->address ?? 'Address not available',
                'storeHours' => $store->operating_hours ?? 'Hours not specified',
                'storeStatus' => $store->status ? 'Open' : 'Closed',
                'storeRecommended' => $store->recommand ? 'Yes' : 'No',
            ]);
        } else {
            // Fallback values if no store
            $variables = array_merge($variables, [
                'storeName' => 'Unknown Store',
                'storeDescription' => '',
                'storeAddress' => 'Address not available',
                'storeHours' => 'Hours not specified',
                'storeStatus' => 'Unknown',
                'storeRecommended' => 'No',
            ]);
        }

        $processedMessage = $template->processContent($variables);

        Log::info('Advertisement message processed', [
            'ad_id' => $advertisement->id,
            'user_id' => $userId,
            'processed_message' => $processedMessage,
            'variables_used' => $variables
        ]);

        return $processedMessage;
    }

    /**
     * Get user variables for advertisement template using real Telegram user data
     */
    private function getUserVariablesForAdvertisement(int $userId): array
    {
        try {
            // Get real user information from Telegram API
            $userInfo = $this->getTelegramUserInfo((string) $userId);

            if (!$userInfo) {
                // Return default values if user info not available
                return [
                    'userId' => (string) $userId,
                    'userFirstName' => 'User',
                    'userLastName' => '',
                    'userUsername' => '',
                    'userFullName' => 'User',
                    'userMention' => 'User',
                    'userLanguageCode' => 'en',
                    'userIsBot' => 'false',
                    'userIsPremium' => 'false',
                ];
            }

            // Extract real user information from Telegram API response
            $firstName = $userInfo['first_name'] ?? '';
            $lastName = $userInfo['last_name'] ?? '';
            $username = $userInfo['username'] ?? '';
            $languageCode = $userInfo['language_code'] ?? 'en';
            $isBot = $userInfo['is_bot'] ?? false;
            $isPremium = $userInfo['is_premium'] ?? false;

            $fullName = trim($firstName . ' ' . $lastName);
            $mention = $username ? '@' . $username : ($firstName ?: 'User');

            return [
                'userId' => (string) $userId,
                'userFirstName' => $firstName,
                'userLastName' => $lastName,
                'userUsername' => $username,
                'userFullName' => $fullName,
                'userMention' => $mention,
                'userLanguageCode' => $languageCode,
                'userIsBot' => $isBot ? 'true' : 'false',
                'userIsPremium' => $isPremium ? 'true' : 'false',
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get user variables for advertisement', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            // Return default values on error
            return [
                'userId' => (string) $userId,
                'userFirstName' => 'User',
                'userLastName' => '',
                'userUsername' => '',
                'userFullName' => 'User',
                'userMention' => 'User',
                'userLanguageCode' => 'en',
                'userIsBot' => 'false',
                'userIsPremium' => 'false',
            ];
        }
    }

    /**
     * Get real user information from Telegram API using getChatMember
     */
    private function getTelegramUserInfo(string $userId): ?array
    {
        try {
            $bot = $this->telegraphBotService->getConfiguredBot();

            if (!$bot) {
                Log::warning('Bot not configured for getting user info', ['user_id' => $userId]);
                return null;
            }

            // Make direct Telegram API call to get user information
            // Using Laravel's HTTP client to make the API call
            $response = \Illuminate\Support\Facades\Http::post('https://api.telegram.org/bot' . $bot->token . '/getChatMember', [
                'chat_id' => $userId,
                'user_id' => $userId
            ]);

            $responseData = $response->json();

            if (!$responseData['ok']) {
                Log::warning('Failed to get user info from Telegram API', [
                    'user_id' => $userId,
                    'response' => $responseData
                ]);
                return null;
            }

            $userInfo = $responseData['result']['user'];

            Log::info('Successfully retrieved real user info from Telegram API', [
                'user_id' => $userId,
                'user_info' => $userInfo
            ]);

            return $userInfo;

        } catch (\Exception $e) {
            Log::error('Exception while getting user info from Telegram API', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get configured bot ID
     */
    private function getConfiguredBotId(): int
    {
        try {
            $bot = $this->telegraphBotService->getConfiguredBot();
            return $bot ? $bot->id : 1; // Default to 1 if no bot found
        } catch (\Exception $e) {
            Log::error('Failed to get configured bot ID', [
                'error' => $e->getMessage()
            ]);
            return 1; // Default fallback
        }
    }

    /**
     * Get active Telegram users (placeholder - implement based on your user management)
     */
    private function getActiveTelegramUsers(): array
    {
        // Get all active Telegram chats from the Telegraph package
        $chats = \DefStudio\Telegraph\Models\TelegraphChat::all();

        $userIds = [];
        foreach ($chats as $chat) {
            $userIds[] = (int) $chat->chat_id;
        }

        Log::info('Found active Telegram users', [
            'total_users' => count($userIds),
            'user_ids' => $userIds,
        ]);

        return $userIds;
    }

    /**
     * Process advertisement delivery to eligible users (automatically uses chunked delivery for large user bases)
     */
    public function processAdvertisementDelivery(Advertisement $advertisement, int $chunkSize = 100): array
    {
        try {
            Log::info('Starting advertisement delivery process', [
                'ad_id' => $advertisement->id,
                'ad_title' => $advertisement->title,
                'chunk_size' => $chunkSize,
            ]);

            // Get all users for this advertisement
            $allUsers = $this->getAllUsers($advertisement);

            if ($allUsers->isEmpty()) {
                Log::info('No users found for advertisement', [
                    'ad_id' => $advertisement->id,
                ]);

                return [
                    'success' => true,
                    'delivered_count' => 0,
                    'message' => 'No users found',
                    'batches_created' => 0,
                ];
            }

            $totalUsers = $allUsers->count();

            // Always use chunked delivery for better performance and scalability
            Log::info('Using chunked delivery for advertisement', [
                'ad_id' => $advertisement->id,
                'total_users' => $totalUsers,
                'chunk_size' => $chunkSize,
            ]);

            // Split users into chunks
            $userChunks = $allUsers->chunk($chunkSize);
            $totalBatches = $userChunks->count();
            $batchNumber = 0;

            Log::info('Creating advertisement delivery batches', [
                'ad_id' => $advertisement->id,
                'total_users' => $totalUsers,
                'chunk_size' => $chunkSize,
                'total_batches' => $totalBatches,
            ]);

            // Dispatch batch jobs
            foreach ($userChunks as $userChunk) {
                $batchNumber++;

                ProcessAdvertisementBatch::dispatch(
                    $advertisement,
                    $userChunk->toArray(),
                    $batchNumber,
                    $totalBatches
                )->onQueue('advertisements');
            }

            Log::info('Advertisement delivery batches dispatched', [
                'ad_id' => $advertisement->id,
                'total_batches' => $totalBatches,
                'total_users' => $totalUsers,
            ]);

            return [
                'success' => true,
                'delivered_count' => 0, // Will be updated by batch jobs
                'failed_count' => 0, // Will be updated by batch jobs
                'total_users' => $totalUsers,
                'batches_created' => $totalBatches,
                'message' => "Created {$totalBatches} batches for delivery",
            ];

        } catch (\Exception $e) {
            Log::error('Failed to process advertisement delivery', [
                'ad_id' => $advertisement->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get all users for advertisement delivery
     */
    private function getAllUsers(Advertisement $advertisement): \Illuminate\Support\Collection
    {
        try {
            $bot = $this->telegraphBotService->getConfiguredBot();
            if (!$bot) {
                Log::warning('No bot configured, using test users');

            }

            Log::info('Getting all Telegram users for advertisement', [
                'ad_id' => $advertisement->id,
                'bot_id' => $bot->id,
            ]);

            // Get ALL users from TelegraphChat table (all users who have interacted with the bot)
            // For advertisements, we want to send to all users, not just those who recently interacted
            $chats = $this->telegraphChatRepository->getChatsByBotId($bot->id);

            Log::info('Found all users in database', [
                'ad_id' => $advertisement->id,
                'total_users' => $chats->count(),
                'user_ids' => $chats->pluck('chat_id')->toArray(),
            ]);

            // Send to ALL users - no eligibility filtering
            // Frequency cap only determines WHEN to send, not WHO to send to
            $allUsers = $chats->pluck('chat_id')->map(function ($chatId) {
                return (int) $chatId;
            });

            Log::info('Sending advertisement to all users', [
                'ad_id' => $advertisement->id,
                'total_users' => $allUsers->count(),
                'user_ids' => $allUsers->toArray(),
            ]);

            return $allUsers;

        } catch (\Exception $e) {
            Log::error('Failed to get eligible users', [
                'ad_id' => $advertisement->id,
                'error' => $e->getMessage(),
            ]);

            return collect(); // Return empty collection on error
        }
    }


    /**
     * Send advertisement to a specific user (private implementation)
     */
    public function sendAdvertisementToUserPrivate(Advertisement $advertisement, int $userId): array
    {
        try {
            Log::info('sendAdvertisementToUserPrivate called', [
                'ad_id' => $advertisement->id,
                'user_id' => $userId,
            ]);

            Log::info('After first log in sendAdvertisementToUserPrivate', [
                'ad_id' => $advertisement->id,
                'user_id' => $userId,
            ]);

            // Build the advertisement message
            Log::info('About to call buildAdvertisementMessage', [
                'ad_id' => $advertisement->id,
                'user_id' => $userId
            ]);
            $message = $this->buildAdvertisementMessage($advertisement, $userId);
            Log::info('buildAdvertisementMessage returned', [
                'ad_id' => $advertisement->id,
                'user_id' => $userId,
                'message_length' => strlen($message)
            ]);

            // Check if advertisement has media
            Log::info('Checking advertisement media', [
                'ad_id' => $advertisement->id,
                'media_url' => $advertisement->media_url,
                'media_url_empty' => empty($advertisement->media_url),
                'media_url_null' => is_null($advertisement->media_url),
            ]);

            if (!empty($advertisement->media_url)) {
                // Send media with caption
                Log::info('Sending advertisement with media', ['ad_id' => $advertisement->id]);
                $sendResult = $this->sendAdvertisementWithMedia($advertisement, (string) $userId, $message);
            } else {
                // Send text-only advertisement
                Log::info('Sending text-only advertisement', [
                    'ad_id' => $advertisement->id,
                    'user_id' => $userId,
                ]);

                try {
                    // Create keyboard for text-only ads
                    $keyboard = $this->createAdvertisementKeyboard($advertisement);

                    // Send text message with keyboard
                    $sendResult = $this->telegraphBotService->sendMessage((string) $userId, $message, ['keyboard' => $keyboard]);

                    if (!$sendResult || !($sendResult['success'] ?? false)) {
                        throw new \Exception($sendResult['message'] ?? 'Failed to send text message');
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to send text-only advertisement', [
                        'ad_id' => $advertisement->id,
                        'user_id' => $userId,
                        'error' => $e->getMessage(),
                    ]);

                    return [
                        'success' => false,
                        'message' => 'Failed to send text advertisement: ' . $e->getMessage(),
                    ];
                }
            }

            if (!$sendResult['success']) {
                Log::error('Failed to send advertisement via Telegram', [
                    'ad_id' => $advertisement->id,
                    'user_id' => $userId,
                    'error' => $sendResult['message'],
                ]);

                return [
                    'success' => false,
                    'message' => $sendResult['message'],
                ];
            }

            // Record the send only if successful
            $this->recordAdvertisementSend($advertisement->id, $userId);

            Log::info('Advertisement sent successfully via Telegram', [
                'ad_id' => $advertisement->id,
                'user_id' => $userId,
                'has_media' => !empty($advertisement->media_url),
                'telegram_response' => $sendResult['message'],
            ]);

            return [
                'success' => true,
                'message_id' => 'telegram_sent', // We don't get the actual message ID from Telegraph
                'telegram_response' => $sendResult['message'],
            ];

        } catch (\Exception $e) {
            Log::error('Failed to send advertisement to user', [
                'ad_id' => $advertisement->id,
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send advertisement with media (photo/video/document)
     */
    private function sendAdvertisementWithMedia(Advertisement $advertisement, string $userId, string $message): array
    {
        try {
            $mediaUrl = $advertisement->media_url;
            $mediaType = $this->getMediaType($mediaUrl);

            Log::info('Sending advertisement with media', [
                'ad_id' => $advertisement->id,
                'user_id' => $userId,
                'media_url' => $mediaUrl,
                'media_type' => $mediaType,
                'sub_btns' => $advertisement->sub_btns,
            ]);

            // Create keyboard with social media buttons if they exist
            $keyboard = $this->createAdvertisementKeyboard($advertisement);

            Log::info('Created keyboard for advertisement', [
                'ad_id' => $advertisement->id,
                'keyboard_exists' => $keyboard !== null,
                'sub_btns_count' => count($advertisement->sub_btns ?? []),
                'sub_btns_data' => $advertisement->sub_btns,
                'keyboard' => $keyboard
            ]);

            // Handle localhost URLs by sending the actual file
            if (str_contains($mediaUrl, 'localhost')) {
                $localFilePath = $this->convertUrlToLocalPath($mediaUrl);

                if (!file_exists($localFilePath)) {
                    Log::error('Local media file not found - cannot send advertisement', [
                        'ad_id' => $advertisement->id,
                        'file_path' => $localFilePath,
                    ]);

                    return [
                        'success' => false,
                        'message' => 'Local media file not found: ' . $localFilePath,
                    ];
                }

                // Send local file with keyboard
                return $this->telegraphBotService->sendMedia($userId, $localFilePath, $mediaType, $message, ['keyboard' => $keyboard]);
            } else {
                // Send remote URL with keyboard
                return $this->telegraphBotService->sendMedia($userId, $mediaUrl, $mediaType, $message, ['keyboard' => $keyboard]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to send advertisement with media', [
                'ad_id' => $advertisement->id,
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to send media: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Create keyboard with social media buttons for advertisements
     */
    private function createAdvertisementKeyboard(Advertisement $advertisement): Keyboard
    {
        $subBtns = $advertisement->sub_btns ?? [];
        $socialButtons = [];

        // Add social media buttons
        if (!empty($subBtns) && is_array($subBtns)) {
            foreach ($subBtns as $socialBtn) {
                if (!empty($socialBtn['url']) && !empty($socialBtn['label'])) {
                    $buttonText = $socialBtn['label'];
                    $buttonUrl = $this->buildSocialMediaUrl($socialBtn['platform'], $socialBtn['url']);

                    if ($buttonUrl) {
                        $socialButtons[] = Button::make($buttonText)->url($buttonUrl);
                    }
                }
            }
        }

        // Group all buttons into pairs for two columns
        $keyboard = Keyboard::make();
        if (!empty($socialButtons)) {
            $buttonPairs = array_chunk($socialButtons, 2);
            foreach ($buttonPairs as $pair) {
                $keyboard->row($pair);
            }
        }

        Log::info('subBtns:=============>'. count($subBtns));

        return $keyboard;
    }

    /**
     * Build social media URL from platform and username
     */
    private function buildSocialMediaUrl(string $platform, string $username): ?string
    {
        // Remove @ symbol if present
        $username = ltrim($username, '@');

        if (empty($username)) {
            return null;
        }

        return match ($platform) {
            'telegram' => "https://t.me/{$username}",
            'wechat' => "https://weixin.qq.com/r/{$username}",
            'tiktok' => "https://www.tiktok.com/@{$username}",
            'facebook' => "https://facebook.com/{$username}",
            'instagram' => "https://instagram.com/{$username}",
            'twitter' => "https://twitter.com/{$username}",
            'whatsapp' => "https://wa.me/{$username}",
            default => null,
        };
    }

    /**
     * Determine media type from URL
     */
    private function getMediaType(string $url): string
    {
        $extension = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));

        $videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

        if (in_array($extension, $videoExtensions)) {
            return 'video';
        } elseif (in_array($extension, $imageExtensions)) {
            return 'image';
        }

        // Default to image if unknown
        return 'image';
    }

    /**
     * Convert URL to local file path
     */
    private function convertUrlToLocalPath(string $url): string
    {
        // Remove protocol and domain from URL
        $path = parse_url($url, PHP_URL_PATH);

        // Convert to public path
        return public_path($path);
    }

    /**
     * Schedule the initial delivery for a new advertisement
     */
    private function scheduleInitialDelivery(Advertisement $advertisement): void
    {
        try {
            // Only schedule if advertisement is active
            if ($advertisement->status !== 1) {
                Log::info('Advertisement not active, skipping initial delivery', [
                    'ad_id' => $advertisement->id,
                    'status' => $advertisement->status,
                ]);
                return;
            }

            // Cancel any existing jobs first to prevent duplicates
            $this->cancelExistingJobs($advertisement->id);

            $now = now();
            $startDate = $advertisement->start_date ? $advertisement->start_date : $now;
            $endDate = $advertisement->end_date;

            // Check if advertisement is within valid date range
            if ($endDate && $now->gt($endDate)) {
                Log::info('Advertisement end date has passed, skipping initial delivery', [
                    'ad_id' => $advertisement->id,
                    'end_date' => $endDate,
                    'current_time' => $now,
                ]);
                return;
            }

            // Check if there's already a scheduled delivery job for this advertisement
            $existingJob = \DB::table('jobs')
                ->where('queue', 'advertisements')
                ->where('payload', 'like', '%ProcessAdvertisementDelivery%')
                ->where('payload', 'like', '%i:' . $advertisement->id . ';%')
                ->where('available_at', '>', now()->timestamp)
                ->first();

            if ($existingJob) {
                Log::info('Job already scheduled for this advertisement, skipping duplicate scheduling', [
                    'ad_id' => $advertisement->id,
                    'existing_job_id' => $existingJob->id,
                ]);
                return;
            }

            // Determine when to start delivery
            $frequencyMinutes = $advertisement->frequency_cap_minutes ?? 1440; // Default to 24 hours if not set

            if ($startDate->isFuture()) {
                // If start date is in future, schedule for start_date + frequency_cap
                $deliveryTime = $startDate->copy()->addMinutes($frequencyMinutes);
            } else {
                // If start date is now or past, schedule for current_time + frequency_cap
                $deliveryTime = $now->copy()->addMinutes($frequencyMinutes);
            }

            // Schedule the first delivery
            ProcessAdvertisementDelivery::dispatch($advertisement)
                ->delay($deliveryTime)
                ->onQueue('advertisements');

            Log::info('Initial advertisement delivery scheduled', [
                'ad_id' => $advertisement->id,
                'delivery_time' => $deliveryTime->format('Y-m-d H:i:s'),
                'frequency_minutes' => $advertisement->frequency_cap_minutes ?? 1440,
                'start_date' => $startDate->format('Y-m-d H:i:s'),
                'end_date' => $endDate ? $endDate->format('Y-m-d H:i:s') : 'No end date',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to schedule initial advertisement delivery', [
                'ad_id' => $advertisement->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Check if scheduling parameters have changed
     */
    private function hasSchedulingParametersChanged(
        Advertisement $oldAdvertisement,
        Advertisement $newAdvertisement,
        ?int $oldFrequencyCapMinutes,
        ?\Carbon\Carbon $oldStartDate,
        ?\Carbon\Carbon $oldEndDate
    ): bool {
        // Check frequency cap change
        if ($oldFrequencyCapMinutes !== $newAdvertisement->frequency_cap_minutes) {
            return true;
        }

        // Check start date change
        if (($oldStartDate?->timestamp ?? null) !== ($newAdvertisement->start_date?->timestamp ?? null)) {
            return true;
        }

        // Check end date change
        if (($oldEndDate?->timestamp ?? null) !== ($newAdvertisement->end_date?->timestamp ?? null)) {
            return true;
        }

        return false;
    }

    /**
     * Cancel existing scheduled jobs for an advertisement
     */
    private function cancelExistingJobs(int $advertisementId): void
    {
        try {
            // Delete scheduled jobs from the jobs table
            $deletedCount = \DB::table('jobs')
                ->where('queue', 'advertisements')
                ->where('payload', 'like', '%ProcessAdvertisementDelivery%')
                ->where('payload', 'like', '%i:' . $advertisementId . ';%')
                ->delete();

            Log::info('Canceled existing advertisement jobs', [
                'ad_id' => $advertisementId,
                'jobs_canceled' => $deletedCount,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to cancel existing advertisement jobs', [
                'ad_id' => $advertisementId,
                'error' => $e->getMessage(),
            ]);
        }
    }

}
