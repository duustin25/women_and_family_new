<?php


use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

// Landing Page Route
use App\Http\Controllers\HomeController;

// Admin Routes:
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\OrganizationController;
use App\Http\Controllers\Admin\OfficialController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\MembersController;
use App\Http\Controllers\Admin\MembershipApplicationController;
use App\Http\Controllers\Admin\OrganizationEventController;

// Public Routes:
use App\Http\Controllers\Public\PublicAnnouncementController;
use App\Http\Controllers\Public\PublicServicesController;
use App\Http\Controllers\Public\PublicOrganizationController;
use App\Http\Controllers\Public\MembershipController;
use App\Http\Controllers\Public\MemberPortalController;
use App\Http\Controllers\Public\MemberVerificationController;
use App\Http\Controllers\Public\ChatbotController;

Route::post('/chatbot/query', [ChatbotController::class, 'query'])->middleware('throttle:10,1');
Route::get('/chat', [ChatbotController::class, 'index'])->name('chat.index');
Route::post('/chat/send', [ChatbotController::class, 'chat'])->name('chat.send');


// 1. Public Landing Page
Route::get('/', [HomeController::class, 'index'])->name('home');

// --- PUBLIC ROUTES ---
Route::prefix('announcements')->group(function () {
    // Keep this as announcements.index for the public feed
    Route::get('/', [PublicAnnouncementController::class, 'index'])->name('announcements.index');
    Route::get('/{announcement}', [PublicAnnouncementController::class, 'show'])->name('announcements.show');
});


// Public Organization Routes
Route::prefix('organizations')->group(function () {
    Route::get('/', [PublicOrganizationController::class, 'index'])->name('public.organizations.index');
    Route::get('/{organization}', [PublicOrganizationController::class, 'show'])->name('public.organizations.show');

    // Public Forms or Application Routes
    Route::get('/{organization}/apply', [MembershipController::class, 'create'])
        ->name('public.organizations.apply');
    Route::post('/{organization}/apply', [MembershipController::class, 'store'])
        ->name('public.organizations.submit')->middleware('throttle:3,1');

    Route::get('/{organization}/apply/{application}/print', [MembershipController::class, 'print'])
        ->name('public.organizations.print');
});





// 4. Public Services Routes
Route::controller(PublicServicesController::class)->group(function () {
    Route::get('/vawc', 'vawc')->name('vawc.index');
    Route::get('/gad', 'gad')->name('gad.index');
    Route::get('/gad/register', 'gadRegister')->name('gad.register');
    Route::post('/gad/register', [PublicServicesController::class, 'storeMembershipApplication'])->name('gad.register.store');
    Route::get('/bcpc', 'bcpc')->name('bcpc.index');
    Route::get('/officials', 'officials')->name('officials.index');
    Route::get('/laws', 'laws')->name('public.laws.index');
});


//  Authenticated Routes (Keep 'dashboard' standard)
Route::middleware(['auth', 'verified'])->group(function () {

    //Dashboard admin (Summarized System Overview)
    Route::get('dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');


    // This turns 'announcements.index' into 'admin.announcements.index'
    Route::group(['prefix' => 'admin', 'as' => 'admin.', 'middleware' => ['role:admin,head,president']], function () {
        Route::resource('announcements', AnnouncementController::class);
        Route::get('organizations/{organization:slug}/members', [OrganizationController::class, 'members'])->name('organizations.members');
        Route::resource('organizations', OrganizationController::class);


        // ------------------------------------------------------------


        // 'officials'
        Route::resource('officials', OfficialController::class);


        // 2. Membership Applications (Manual Order Fix)
        // Static routes (create) MUST come before wildcard routes ({application})
        Route::get('applications', [MembershipApplicationController::class, 'index'])->name('applications.index');
        Route::get('applications/create', [MembershipApplicationController::class, 'create'])->name('applications.create');
        Route::get('applications/encode/{organization:slug}', [MembershipApplicationController::class, 'encode'])->name('applications.encode'); // NEW: Admin-specific intake URL
        Route::get('applications/{application}/print', [MembershipApplicationController::class, 'print'])->name('applications.print');
        Route::get('applications/{application}', [MembershipApplicationController::class, 'show'])->name('applications.show');
        Route::patch('applications/{application}/status', [MembershipApplicationController::class, 'updateStatus'])->name('applications.update-status');
        Route::get('applications/{application}/edit', [MembershipApplicationController::class, 'edit'])->name('applications.edit');
        Route::put('applications/{application}', [MembershipApplicationController::class, 'update'])->name('applications.update');


        Route::get('analytics/print', [AnalyticsController::class, 'print'])->name('analytics.print');
        Route::get('analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

        // Audit Trail / Backtrack
        Route::get('/audit-logs', [AuditLogController::class, 'index'])
            ->name('audit-logs');

        Route::get('/members', [MembersController::class, 'index'])->name('members');
        Route::post('/members/{member}/email', [MembersController::class, 'sendIndividualEmail'])->name('members.email.individual');
        Route::post('/members/bulk-email', [MembersController::class, 'sendBulkEmail'])->name('members.email.bulk');
        Route::post('/members/{member}/beneficiary', [MembersController::class, 'tagBeneficiary'])->name('members.beneficiary.tag');

        // GAD Events Module (Admin)
        Route::resource('gad/events', \App\Http\Controllers\Admin\GadEventController::class, ['names' => 'gad.events']);
        Route::patch('gad/events/{id}/status', [\App\Http\Controllers\Admin\GadEventController::class, 'updateStatus'])->name('gad.events.update-status');

        // Organization Event Proposals (President Portal)
        Route::resource('organization/events', OrganizationEventController::class, ['names' => 'organization.events']);

        // Notifications
        Route::post('notifications/{id}/read', [\App\Http\Controllers\Admin\NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('notifications/mark-all-read', [\App\Http\Controllers\Admin\NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    });
});

// STRICT ADMIN & HEAD ONLY ROUTES: VAWC Confidential Registry
Route::group(['prefix' => 'admin', 'as' => 'admin.', 'middleware' => ['auth', 'verified', 'role:admin,head']], function () {
    // CASE MANAGEMENT BASE ON WORKFLOW OF HANDLING VAWC CASES AND BPO ISSUANCE
    // -----------------------------------------------------------
    // VAWC Digital Case Management (RA 9262)
    Route::get('vawc/cases/create', [\App\Http\Controllers\Admin\VawcController::class, 'create'])->name('vawc.create');
    Route::post('vawc/cases', [\App\Http\Controllers\Admin\VawcController::class, 'store'])->name('vawc.store');
    Route::get('vawc/cases', [\App\Http\Controllers\Admin\VawcController::class, 'index'])->name('vawc.index');
    Route::get('vawc/dashboard', [\App\Http\Controllers\Admin\VawcController::class, 'dashboard'])->name('vawc.dashboard');
    Route::get('vawc/cases/{id}', [\App\Http\Controllers\Admin\VawcController::class, 'show'])->name('vawc.show');

    // BPO Lifecycle Routes
    Route::post('vawc/cases/{id}/apply-bpo', [\App\Http\Controllers\Admin\VawcController::class, 'applyBpo'])->name('vawc.apply-bpo');
    Route::post('vawc/cases/{id}/issue-bpo', [\App\Http\Controllers\Admin\VawcController::class, 'issueBpo'])->name('vawc.issue-bpo');
    Route::post('vawc/cases/{id}/record-service', [\App\Http\Controllers\Admin\VawcController::class, 'recordBpoService'])->name('vawc.record-service');
    Route::get('vawc/cases/{id}/pnp-transmittal', [\App\Http\Controllers\Admin\VawcController::class, 'pnpTransmittal'])->name('vawc.pnp-transmittal');
    Route::get('vawc/cases/{id}/print-bpo', [\App\Http\Controllers\Admin\VawcController::class, 'printBpo'])->name('vawc.print-bpo');
    Route::post('vawc/cases/{id}/log-compliance', [\App\Http\Controllers\Admin\VawcController::class, 'logCompliance'])->name('vawc.log-compliance');
    Route::post('vawc/cases/{id}/escalate', [\App\Http\Controllers\Admin\VawcController::class, 'escalate'])->name('vawc.escalate');
    Route::get('vawc/cases/{id}/complaint-form', [\App\Http\Controllers\Admin\VawcController::class, 'complaintForm'])->name('vawc.complaint-form');
    Route::post('vawc/cases/{id}/close', [\App\Http\Controllers\Admin\VawcController::class, 'closeCase'])->name('vawc.close');
    // ------------------------------------------------------------

    // BCPC Nutrition Monitoring (e-OPT Plus)
    Route::get('bcpc/cases/create', [\App\Http\Controllers\Admin\BcpcMonitoringController::class, 'create'])->name('bcpc.create');
    Route::post('bcpc/cases', [\App\Http\Controllers\Admin\BcpcMonitoringController::class, 'store'])->name('bcpc.store');
    Route::get('bcpc/cases', [\App\Http\Controllers\Admin\BcpcMonitoringController::class, 'index'])->name('bcpc.index');
    Route::get('bcpc/dashboard', [\App\Http\Controllers\Admin\BcpcMonitoringController::class, 'dashboard'])->name('bcpc.dashboard');
    Route::get('bcpc/cases/{id}', [\App\Http\Controllers\Admin\BcpcMonitoringController::class, 'show'])->name('bcpc.show');
    Route::put('bcpc/cases/{id}', [\App\Http\Controllers\Admin\BcpcMonitoringController::class, 'update'])->name('bcpc.update');
    // ------------------------------------------------------------
});

// STRICT ADMIN-ONLY ROUTES: System Taxonomy & Configurations

Route::group(['prefix' => 'admin', 'as' => 'admin.', 'middleware' => ['auth', 'verified', 'role:admin']], function () {
    Route::get('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings/case-abuse-types', [\App\Http\Controllers\Admin\SettingsController::class, 'storeAbuseType'])->name('settings.case-abuse-types.store');
    Route::patch('/settings/case-abuse-types/{id}', [\App\Http\Controllers\Admin\SettingsController::class, 'updateAbuseType'])->name('settings.case-abuse-types.update');

    // Zones Settings Routes
    Route::post('/settings/zones', [\App\Http\Controllers\Admin\SettingsController::class, 'storeZone'])->name('settings.zones.store');
    Route::patch('/settings/zones/{id}', [\App\Http\Controllers\Admin\SettingsController::class, 'updateZone'])->name('settings.zones.update');

    // System Users Management (ADMIN ONLY + THROTTLED)
    Route::get('system-users/archives', [\App\Http\Controllers\Admin\SystemUserController::class, 'archives'])->name('system-users.archives');
    Route::post('system-users/{id}/restore', [\App\Http\Controllers\Admin\SystemUserController::class, 'restore'])->name('system-users.restore');
    Route::resource('system-users', \App\Http\Controllers\Admin\SystemUserController::class)->middleware('throttle:10,1');
});


require __DIR__ . '/settings.php';
