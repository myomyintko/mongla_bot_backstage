<?php

declare(strict_types=1);

namespace App\Services\NetworkRetry;

use Illuminate\Support\Facades\Log;
use Exception;

class NetworkRetryService
{
    /**
     * Execute a network operation with retry logic and exponential backoff
     */
    public static function executeWithRetry(callable $operation, string $operationName = 'network_operation', int $maxRetries = 3, int $baseDelaySeconds = 1): array
    {
        $attempt = 1;
        $lastException = null;

        while ($attempt <= $maxRetries) {
            try {
                Log::info("Executing {$operationName} (attempt {$attempt}/{$maxRetries})");

                $result = $operation();

                // If operation returns array with success=false, treat as failure
                if (is_array($result) && isset($result['success']) && !$result['success']) {
                    $errorMessage = $result['message'] ?? 'Unknown error';

                    // Check for network-related errors
                    if (self::isNetworkError($errorMessage)) {
                        Log::warning("Network error detected in {$operationName} (attempt {$attempt}/{$maxRetries}): {$errorMessage}");

                        if ($attempt < $maxRetries) {
                            $delay = self::calculateDelay($attempt, $baseDelaySeconds);
                            Log::info("Retrying {$operationName} after {$delay} seconds...");
                            sleep($delay);
                            $attempt++;
                            continue;
                        } else {
                            Log::error("{$operationName} failed after {$maxRetries} attempts: {$errorMessage}");
                            return [
                                'success' => false,
                                'message' => "Network error after {$maxRetries} attempts: {$errorMessage}",
                                'error_type' => 'network_retry_exhausted',
                                'attempts_made' => $attempt
                            ];
                        }
                    } else {
                        // Non-network error, don't retry
                        Log::info("Non-network error in {$operationName}, not retrying: {$errorMessage}");
                        return $result;
                    }
                }

                // Success
                if ($attempt > 1) {
                    Log::info("{$operationName} succeeded after {$attempt} attempts");
                }
                return $result;

            } catch (Exception $e) {
                $lastException = $e;
                $errorMessage = $e->getMessage();

                Log::warning("Exception in {$operationName} (attempt {$attempt}/{$maxRetries}): {$errorMessage}");

                // Check if this is a network-related exception
                if (self::isNetworkError($errorMessage)) {
                    if ($attempt < $maxRetries) {
                        $delay = self::calculateDelay($attempt, $baseDelaySeconds);
                        Log::info("Retrying {$operationName} after {$delay} seconds due to network error...");
                        sleep($delay);
                        $attempt++;
                        continue;
                    } else {
                        Log::error("{$operationName} failed after {$maxRetries} attempts with network error: {$errorMessage}");
                        return [
                            'success' => false,
                            'message' => "Network error after {$maxRetries} attempts: {$errorMessage}",
                            'error_type' => 'network_retry_exhausted',
                            'attempts_made' => $attempt
                        ];
                    }
                } else {
                    // Non-network exception, don't retry
                    Log::error("Non-network exception in {$operationName}, not retrying: {$errorMessage}");
                    return [
                        'success' => false,
                        'message' => $errorMessage,
                        'error_type' => 'non_network_error'
                    ];
                }
            }
        }

        // Should not reach here, but fallback
        $errorMessage = $lastException ? $lastException->getMessage() : 'Unknown error';
        return [
            'success' => false,
            'message' => "Operation failed after {$maxRetries} attempts: {$errorMessage}",
            'error_type' => 'retry_exhausted',
            'attempts_made' => $maxRetries
        ];
    }

    /**
     * Check if an error message indicates a network-related issue
     */
    private static function isNetworkError(string $errorMessage): bool
    {
        $networkErrorPatterns = [
            'cURL error 6',                    // Could not resolve host
            'cURL error 7',                    // Failed to connect to host
            'cURL error 28',                   // Timeout
            'cURL error 35',                   // SSL/TLS handshake failure
            'Could not resolve host',
            'failed to receive handshake',
            'SSL/TLS connection failed',
            'Connection timed out',
            'Connection refused',
            'Network is unreachable',
            'No route to host',
            'SSL handshake failed',
            'schannel: failed to receive handshake',
        ];

        $errorLower = strtolower($errorMessage);

        foreach ($networkErrorPatterns as $pattern) {
            if (str_contains($errorLower, strtolower($pattern))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate exponential backoff delay with jitter
     */
    private static function calculateDelay(int $attempt, int $baseDelaySeconds): int
    {
        // Exponential backoff: baseDelay * 2^(attempt-1) + random jitter
        $exponentialDelay = $baseDelaySeconds * pow(2, $attempt - 1);

        // Add random jitter (±25% of delay) to avoid thundering herd
        $jitter = rand(-25, 25) / 100.0;
        $finalDelay = intval($exponentialDelay * (1 + $jitter));

        // Cap maximum delay at 60 seconds
        return min($finalDelay, 60);
    }

    /**
     * Check network connectivity before attempting operations
     */
    public static function checkNetworkConnectivity(string $host = 'api.telegram.org', int $port = 443, int $timeoutSeconds = 5): bool
    {
        try {
            Log::info("Checking network connectivity to {$host}:{$port}");

            $connection = @fsockopen($host, $port, $errno, $errstr, $timeoutSeconds);

            if ($connection) {
                fclose($connection);
                Log::info("Network connectivity check passed for {$host}:{$port}");
                return true;
            } else {
                Log::warning("Network connectivity check failed for {$host}:{$port}: {$errstr} (errno: {$errno})");
                return false;
            }
        } catch (Exception $e) {
            Log::warning("Network connectivity check failed for {$host}:{$port}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Wait for network connectivity to be restored
     */
    public static function waitForConnectivity(string $host = 'api.telegram.org', int $port = 443, int $maxWaitSeconds = 60, int $checkIntervalSeconds = 5): bool
    {
        Log::info("Waiting for network connectivity to {$host}:{$port} (max wait: {$maxWaitSeconds}s)");

        $startTime = time();

        while ((time() - $startTime) < $maxWaitSeconds) {
            if (self::checkNetworkConnectivity($host, $port, 3)) {
                $waitTime = time() - $startTime;
                Log::info("Network connectivity restored to {$host}:{$port} after {$waitTime} seconds");
                return true;
            }

            Log::info("Network still unavailable, waiting {$checkIntervalSeconds} seconds...");
            sleep($checkIntervalSeconds);
        }

        Log::error("Network connectivity to {$host}:{$port} not restored within {$maxWaitSeconds} seconds");
        return false;
    }
}