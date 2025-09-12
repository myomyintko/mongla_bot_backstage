<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\TwoFactorAuthentication;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use PragmaRX\Google2FA\Google2FA;
use PragmaRX\Google2FAQRCode\Google2FA as Google2FAQRCode;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

class TwoFactorController extends Controller
{
    protected Google2FA $google2fa;
    protected Google2FAQRCode $google2faQRCode;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
        $this->google2faQRCode = new Google2FAQRCode();
    }

    /**
     * Generate 2FA setup data for the authenticated user.
     */
    public function generateSecret(): JsonResponse
    {
        $user = Auth::user();
        
        // Check if user already has 2FA enabled
        if ($user->twoFactorAuthentication && $user->twoFactorAuthentication->is_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication is already enabled for this account.',
            ], 400);
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
        $twoFactorAuth = TwoFactorAuthentication::updateOrCreate(
            ['user_id' => $user->id],
            [
                'secret_key' => $secretKey,
                'is_enabled' => false,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => [
                'secret_key' => $secretKey,
                'qr_code_url' => $qrCodeDataUrl,
                'manual_entry_key' => $secretKey,
            ],
        ]);
    }

    /**
     * Verify and enable 2FA for the authenticated user.
     */
    public function enable(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        $twoFactorAuth = $user->twoFactorAuthentication;

        if (!$twoFactorAuth || !$twoFactorAuth->secret_key) {
            return response()->json([
                'success' => false,
                'message' => 'No 2FA setup found. Please generate a new secret key first.',
            ], 400);
        }

        // Verify the code
        $valid = $this->google2fa->verifyKey($twoFactorAuth->secret_key, $request->code);

        if (!$valid) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code. Please try again.',
            ], 400);
        }

        // Enable 2FA and generate recovery codes
        $recoveryCodes = $twoFactorAuth->generateRecoveryCodes();
        
        $twoFactorAuth->update([
            'is_enabled' => true,
            'enabled_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Two-factor authentication has been enabled successfully.',
            'data' => [
                'recovery_codes' => $recoveryCodes->toArray(),
            ],
        ]);
    }

    /**
     * Disable 2FA for the authenticated user.
     */
    public function disable(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        $twoFactorAuth = $user->twoFactorAuthentication;

        if (!$twoFactorAuth || !$twoFactorAuth->is_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication is not enabled for this account.',
            ], 400);
        }

        // Verify the code
        $valid = $this->google2fa->verifyKey($twoFactorAuth->secret_key, $request->code);

        if (!$valid) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code. Please try again.',
            ], 400);
        }

        // Disable 2FA
        $twoFactorAuth->update([
            'is_enabled' => false,
            'enabled_at' => null,
            'recovery_codes' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Two-factor authentication has been disabled successfully.',
        ]);
    }

    /**
     * Verify 2FA code during login.
     */
    public function verify(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        $twoFactorAuth = $user->twoFactorAuthentication;

        if (!$twoFactorAuth || !$twoFactorAuth->is_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication is not enabled for this account.',
            ], 400);
        }

        // Verify the code
        $valid = $this->google2fa->verifyKey($twoFactorAuth->secret_key, $request->code);

        if (!$valid) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code. Please try again.',
            ], 400);
        }

        // Mark 2FA as verified for this session
        session(['2fa_verified' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Two-factor authentication verified successfully.',
        ]);
    }

    /**
     * Verify recovery code during login.
     */
    public function verifyRecoveryCode(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'recovery_code' => 'required|string|size:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        $twoFactorAuth = $user->twoFactorAuthentication;

        if (!$twoFactorAuth || !$twoFactorAuth->is_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication is not enabled for this account.',
            ], 400);
        }

        // Verify the recovery code
        $valid = $twoFactorAuth->useRecoveryCode($request->recovery_code);

        if (!$valid) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid recovery code. Please try again.',
            ], 400);
        }

        // Mark 2FA as verified for this session
        session(['2fa_verified' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Recovery code verified successfully.',
        ]);
    }

    /**
     * Get 2FA status for the authenticated user.
     */
    public function status(): JsonResponse
    {
        $user = Auth::user();
        $twoFactorAuth = $user->twoFactorAuthentication;

        return response()->json([
            'success' => true,
            'data' => [
                'is_enabled' => $twoFactorAuth ? $twoFactorAuth->is_enabled : false,
                'enabled_at' => $twoFactorAuth ? $twoFactorAuth->enabled_at : null,
                'has_recovery_codes' => $twoFactorAuth ? $twoFactorAuth->hasRecoveryCodes() : false,
            ],
        ]);
    }


    /**
     * Regenerate recovery codes.
     */
    public function regenerateRecoveryCodes(): JsonResponse
    {
        $user = Auth::user();
        $twoFactorAuth = $user->twoFactorAuthentication;

        if (!$twoFactorAuth || !$twoFactorAuth->is_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication is not enabled for this account.',
            ], 400);
        }

        $recoveryCodes = $twoFactorAuth->generateRecoveryCodes();

        return response()->json([
            'success' => true,
            'message' => 'Recovery codes have been regenerated successfully.',
            'data' => [
                'recovery_codes' => $recoveryCodes->toArray(),
            ],
        ]);
    }
}
