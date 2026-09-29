<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        // Enforce HTTPS scheme only in production
        if ($this->app->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Register Observers for Audit Logging and Member Synchronization
        \App\Models\CaseReport::observe(\App\Observers\AuditObserver::class);
        \App\Models\VawcCase::observe(\App\Observers\AuditObserver::class);
        \App\Models\VawcDossier::observe(\App\Observers\AuditObserver::class);
        \App\Models\VawcInvolvedParty::observe(\App\Observers\AuditObserver::class);
        \App\Models\VawcAssessment::observe(\App\Observers\AuditObserver::class);
        \App\Models\VawcProtectionOrder::observe(\App\Observers\AuditObserver::class);
        \App\Models\VawcAgencyTransmittal::observe(\App\Observers\AuditObserver::class);
        \App\Models\VawcBpoServiceRecord::observe(\App\Observers\AuditObserver::class);
        \App\Models\VawcComplianceLog::observe(\App\Observers\AuditObserver::class);
        \App\Models\VawcLegalEscalation::observe(\App\Observers\AuditObserver::class);
        \App\Models\Member::observe(\App\Observers\AuditObserver::class);
        \App\Models\BcpcChild::observe(\App\Observers\AuditObserver::class);
        \App\Models\BcpcAssessment::observe(\App\Observers\AuditObserver::class);
        \App\Models\User::observe(\App\Observers\AuditObserver::class);
        \App\Models\Announcement::observe(\App\Observers\AuditObserver::class);
        \App\Models\Organization::observe(\App\Observers\AuditObserver::class);
        \App\Models\MembershipApplication::observe(\App\Observers\MembershipApplicationObserver::class);

        // Resolve polymorphic relation for custom non-model types
        \Illuminate\Database\Eloquent\Relations\Relation::morphMap([
            'Route' => \App\Models\AuditLog::class,
            'DatabaseBackup' => \App\Models\AuditLog::class,
            'SecurityEvent' => \App\Models\AuditLog::class,
        ]);
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction() && !env('ALLOW_DESTRUCTIVE_COMMANDS', false),
        );

        Password::defaults(
            fn(): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
