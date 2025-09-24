<?php

declare(strict_types=1);

namespace App\Services\TwoFactor;

use App\Models\User;
use PragmaRX\Google2FA\Google2FA;
use PragmaRX\Google2FAQRCode\Google2FA as Google2FAQRCode;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

class TwoFactorService implements TwoFactorServiceInterface
{
    protected Google2FA $google2fa;
    protected Google2FAQRCode $google2faQRCode;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
        $this->google2faQRCode = new Google2FAQRCode();
    }

    public function generateSecret(User $user): array
    {
        // Check if user already has 2FA enabled
        if ($user->twoFactorAuthentication && $user->twoFactorAuthentication->is_enabled) {
            return [
                'success' => false,
                'message' => 'Two-factor authentication is already enabled for this account.',
            ];
        }

        // Generate secret key
        $secretKey = $this->google2fa->generateSecretKey();
        
        // Generate QR code as data URL using endroid/qr-code
        try {
            $qrCodeUrl = $this->google2faQRCode->getQRCodeUrl(
                config('app.name'),
                $user->email,
                $secretKey
            );
            
            // Create QR code using endroid/qr-code
            $qrCode = new QrCode(
                data: $qrCodeUrl,
                size: 200,
                margin: 10
            );
            
            $writer = new PngWriter();
            $result = $writer->write($qrCode);
            
            // Convert to data URL
            $qrCodeDataUrl = 'data:image/png;base64,' . base64_encode($result->getString());
        } catch (\Exception $e) {
            // Fallback: generate a simple QR code URL
            $qrCodeDataUrl = $this->google2faQRCode->getQRCodeUrl(
                config('app.name'),
                $user->email,
                $secretKey
            );
        }

        // Create or update 2FA record
        $twoFactorAuth = $user->twoFactorAuthentication()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'secret_key' => $secretKey,
                'is_enabled' => false,
            ]
        );

        return [
            'success' => true,
            'data' => [
                'secret_key' => $secretKey,
                'qr_code_url' => $qrCodeDataUrl,
                'manual_entry_key' => $secretKey,
            ],
        ];
    }

    public function enable(User $user, string $code): array
    {
        $twoFactorAuth = $user->twoFactorAuthentication;

        if (!$twoFactorAuth || !$twoFactorAuth->secret_key) {
            return [
                'success' => false,
                'message' => 'No 2FA setup found. Please generate a new secret key first.',
            ];
        }

        // Verify the code
        $valid = $this->google2fa->verifyKey($twoFactorAuth->secret_key, $code);

        if (!$valid) {
            return [
                'success' => false,
                'message' => 'Invalid verification code. Please try again.',
            ];
        }

        // Enable 2FA and generate recovery codes
        $recoveryCodes = $twoFactorAuth->generateRecoveryCodes();
        
        $twoFactorAuth->update([
            'is_enabled' => true,
            'enabled_at' => now(),
        ]);

        return [
            'success' => true,
            'message' => 'Two-factor authentication has been enabled successfully.',
            'data' => [
                'recovery_codes' => $recoveryCodes->toArray(),
            ],
        ];
    }

    public function disable(User $user, string $code): array
    {
        $twoFactorAuth = $user->twoFactorAuthentication;

        if (!$twoFactorAuth || !$twoFactorAuth->is_enabled) {
            return [
                'success' => false,
                'message' => 'Two-factor authentication is not enabled for this account.',
            ];
        }

        // Verify the code
        $valid = $this->google2fa->verifyKey($twoFactorAuth->secret_key, $code);

        if (!$valid) {
            return [
                'success' => false,
                'message' => 'Invalid verification code. Please try again.',
            ];
        }

        // Disable 2FA
        $twoFactorAuth->update([
            'is_enabled' => false,
            'enabled_at' => null,
            'recovery_codes' => null,
        ]);

        return [
            'success' => true,
            'message' => 'Two-factor authentication has been disabled successfully.',
        ];
    }

    public function verify(User $user, string $code): array
    {
        $twoFactorAuth = $user->twoFactorAuthentication;

        if (!$twoFactorAuth || !$twoFactorAuth->is_enabled) {
            return [
                'success' => false,
                'message' => 'Two-factor authentication is not enabled for this account.',
            ];
        }

        // Verify the code
        $valid = $this->google2fa->verifyKey($twoFactorAuth->secret_key, $code);

        if (!$valid) {
            return [
                'success' => false,
                'message' => 'Invalid verification code. Please try again.',
            ];
        }

        // Mark 2FA as verified for this session
        session(['2fa_verified' => true]);

        return [
            'success' => true,
            'message' => 'Two-factor authentication verified successfully.',
        ];
    }

    public function verifyRecoveryCode(User $user, string $recoveryCode): array
    {
        $twoFactorAuth = $user->twoFactorAuthentication;

        if (!$twoFactorAuth || !$twoFactorAuth->is_enabled) {
            return [
                'success' => false,
                'message' => 'Two-factor authentication is not enabled for this account.',
            ];
        }

        // Verify the recovery code
        $valid = $twoFactorAuth->useRecoveryCode($recoveryCode);

        if (!$valid) {
            return [
                'success' => false,
                'message' => 'Invalid recovery code. Please try again.',
            ];
        }

        // Mark 2FA as verified for this session
        session(['2fa_verified' => true]);

        return [
            'success' => true,
            'message' => 'Recovery code verified successfully.',
        ];
    }

    public function getStatus(User $user): array
    {
        $twoFactorAuth = $user->twoFactorAuthentication;

        return [
            'success' => true,
            'data' => [
                'is_enabled' => $twoFactorAuth ? $twoFactorAuth->is_enabled : false,
                'enabled_at' => $twoFactorAuth ? $twoFactorAuth->enabled_at : null,
                'has_recovery_codes' => $twoFactorAuth ? $twoFactorAuth->hasRecoveryCodes() : false,
            ],
        ];
    }

    public function regenerateRecoveryCodes(User $user): array
    {
        $twoFactorAuth = $user->twoFactorAuthentication;

        if (!$twoFactorAuth || !$twoFactorAuth->is_enabled) {
            return [
                'success' => false,
                'message' => 'Two-factor authentication is not enabled for this account.',
            ];
        }

        $recoveryCodes = $twoFactorAuth->generateRecoveryCodes();

        return [
            'success' => true,
            'message' => 'Recovery codes have been regenerated successfully.',
            'data' => [
                'recovery_codes' => $recoveryCodes->toArray(),
            ],
        ];
    }
}
