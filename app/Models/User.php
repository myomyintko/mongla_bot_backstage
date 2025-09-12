<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'username',
        'avatar',
        'status',
        'password_setup_required',
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => 'integer',
            'password_setup_required' => 'boolean',
        ];
    }

    /**
     * Get status constants
     */
    public const STATUS_ACTIVE = 1;
    public const STATUS_INACTIVE = 2;
    public const STATUS_SUSPENDED = 4;

    /**
     * Get status options
     */
    public static function getStatusOptions(): array
    {
        return [
            self::STATUS_ACTIVE => 'Active',
            self::STATUS_INACTIVE => 'Inactive',
            self::STATUS_SUSPENDED => 'Suspended',
        ];
    }

    /**
     * Get status name
     */
    public function getStatusNameAttribute(): string
    {
        return self::getStatusOptions()[$this->status] ?? 'Unknown';
    }

    /**
     * Get the user's two factor authentication record.
     */
    public function twoFactorAuthentication(): HasOne
    {
        return $this->hasOne(TwoFactorAuthentication::class);
    }

    /**
     * Check if user has 2FA enabled.
     */
    public function hasTwoFactorEnabled(): bool
    {
        return $this->twoFactorAuthentication && $this->twoFactorAuthentication->is_enabled;
    }

    /**
     * Check if user needs to set up password.
     */
    public function needsPasswordSetup(): bool
    {
        return $this->password_setup_required;
    }

    /**
     * Check if 2FA is verified for current session.
     */
    public function isTwoFactorVerified(): bool
    {
        return session('2fa_verified', false);
    }

}
