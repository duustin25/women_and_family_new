<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Auth\OtpSecurityController;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('profile.update');
    Route::post('settings/profile/verify-email-change', [OtpSecurityController::class, 'verifyEmailChange'])
        ->middleware('throttle:6,1')
        ->name('profile.verify-email-change');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::post('settings/password/verify', [OtpSecurityController::class, 'verifyPasswordChange'])
        ->middleware('throttle:6,1')
        ->name('user-password.verify');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/activity', [\App\Http\Controllers\Settings\UserActivityController::class, 'index'])
        ->name('user-activity.index');
});
