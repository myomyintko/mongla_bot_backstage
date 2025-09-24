<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\TwoFactor\TwoFactorServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TwoFactorController extends Controller
{
    public function __construct(
        private TwoFactorServiceInterface $twoFactorService
    ) {}

    /**
     * Generate 2FA setup data for the authenticated user.
     */
    public function generateSecret(): JsonResponse
    {
        $user = Auth::user();
        $result = $this->twoFactorService->generateSecret($user);

        return response()->json($result, $result['success'] ? 200 : 400);
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
        $result = $this->twoFactorService->enable($user, $request->code);

        return response()->json($result, $result['success'] ? 200 : 400);
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
        $result = $this->twoFactorService->disable($user, $request->code);

        return response()->json($result, $result['success'] ? 200 : 400);
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
        $result = $this->twoFactorService->verify($user, $request->code);

        return response()->json($result, $result['success'] ? 200 : 400);
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
        $result = $this->twoFactorService->verifyRecoveryCode($user, $request->recovery_code);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Get 2FA status for the authenticated user.
     */
    public function status(): JsonResponse
    {
        $user = Auth::user();
        $result = $this->twoFactorService->getStatus($user);

        return response()->json($result);
    }

    /**
     * Regenerate recovery codes.
     */
    public function regenerateRecoveryCodes(): JsonResponse
    {
        $user = Auth::user();
        $result = $this->twoFactorService->regenerateRecoveryCodes($user);

        return response()->json($result, $result['success'] ? 200 : 400);
    }
}
