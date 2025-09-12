<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;

class TwoFactorAuthentication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'secret_key',
        'recovery_codes',
        'is_enabled',
        'enabled_at',
    ];

    protected $casts = [
        'recovery_codes' => 'array',
        'is_enabled' => 'boolean',
        'enabled_at' => 'datetime',
    ];

    /**
     * Get the user that owns the two factor authentication.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate recovery codes.
     */
    public function generateRecoveryCodes(): Collection
    {
        $codes = collect();
        for ($i = 0; $i < 8; $i++) {
            $codes->push(strtoupper(substr(md5(uniqid()), 0, 8)));
        }
        
        $this->update(['recovery_codes' => $codes->toArray()]);
        
        return $codes;
    }

    /**
     * Use a recovery code.
     */
    public function useRecoveryCode(string $code): bool
    {
        $codes = collect($this->recovery_codes ?? []);
        $index = $codes->search(strtoupper($code));
        
        if ($index !== false) {
            $codes->forget($index);
            $this->update(['recovery_codes' => $codes->values()->toArray()]);
            return true;
        }
        
        return false;
    }

    /**
     * Check if recovery codes are available.
     */
    public function hasRecoveryCodes(): bool
    {
        return !empty($this->recovery_codes) && count($this->recovery_codes) > 0;
    }
}
