<?php

use App\Http\Controllers\Business\StaffController;
use App\Http\Controllers\Business\CardTempalateController;
use App\Http\Controllers\Business\CustomerController;
use App\Http\Controllers\Business\DashboardController;
use App\Http\Controllers\Business\QRStudioController;
use App\Http\Controllers\Business\IssueStampController;
use App\Http\Controllers\Business\PerkClaimController;
use App\Http\Controllers\Business\StampCodeController;
use App\Http\Controllers\Business\TicketController;
use App\Http\Controllers\ChatBotController;
use App\Http\Controllers\Customer\CustomerAuthController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;
use App\Http\Controllers\DocumentationController;
use App\Http\Controllers\Staff\DashboardController as StaffDashboardController;
use App\Http\Controllers\Staff\StaffAuthController;
use App\Http\Controllers\SuggestionController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/sitemap.xml', function () {
    $pages = [
        ['loc' => url('/'), 'priority' => '1.0', 'changefreq' => 'weekly'],
    ];

    return response()->view('sitemap', compact('pages'))
        ->header('Content-Type', 'text/xml');
});

Route::post('/api/chat', [ChatBotController::class, 'chat'])->middleware('auth');

Route::post('/suggestions', [SuggestionController::class, 'store'])->name('suggestions.store');

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/pricing', function () {
    return Inertia::render('pricing');
})->name('pricing');

Route::get('/documentation', [DocumentationController::class, 'index']);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('business')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::resource('/staffs', StaffController::class);

        Route::get('/issue-stamps/generate-offline', [IssueStampController::class, 'generateOfflineStamps'])
            ->name('business.issue-stamp.generate-offline');

        Route::resource('/card-templates', CardTempalateController::class);
        Route::get('/qr-studio', [QRStudioController::class, 'index']);
        Route::get('/qr-studio/download', [QRStudioController::class, 'download']);
        Route::post('/qr-studio/update', [QRStudioController::class, 'update']);
        Route::resource('/customers', CustomerController::class);
        Route::get('/issue-stamp', [IssueStampController::class, 'index']);
        Route::post('/issue-stamp/scan-customer', [StampCodeController::class, 'recordCustomerScan']);
        Route::get('/stamp-codes', [StampCodeController::class, 'index']);



        Route::get('/perk-claims', [PerkClaimController::class, 'index'])->name('perk-claims.index');
        Route::post('/perk-claims/{perkClaim}/redeem', [PerkClaimController::class, 'markAsRedeemed'])->name('perk-claims.redeem');
        Route::post('/perk-claims/{perkClaim}/undo', [PerkClaimController::class, 'undoRedeem'])->name('perk-claims.undo');

        Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
        Route::post('/tickets', [TicketController::class, 'store'])->name('tickets.store');
        Route::get('/tickets/{id}', [TicketController::class, 'show'])->name('tickets.show');
        Route::post('/tickets/{id}/reply', [TicketController::class, 'reply'])->name('tickets.reply');
    });
});

Route::post('/stamps/record', [StampCodeController::class, 'record'])
    ->name('customer.stamps.record');

// Customer Authentication Routes
Route::prefix('customer')->name('customer.')->group(function () {

    Route::post('/profile/update', [CustomerDashboardController::class, 'updateProfile'])->name('customer.profile.update');
    Route::post('/password/update', [CustomerDashboardController::class, 'updatePassword'])->name('customer.password.update');

    // Guest routes (not authenticated)
    Route::middleware('guest:customer')->group(function () {
        // Login
        Route::get('/login', [CustomerAuthController::class, 'index'])
            ->name('login');

        Route::post('/login', [CustomerAuthController::class, 'login']);

        // Register
        Route::get('/register', [CustomerAuthController::class, 'showRegister'])
            ->name('register');

        Route::post('/register', [CustomerAuthController::class, 'register']);

        Route::get('/forgot-password', [CustomerAuthController::class, 'showForgotPassword'])
            ->name('password.request');

        Route::post('/forgot-password', [CustomerAuthController::class, 'sendResetLink'])
            ->name('password.email');

        Route::get('/reset-password/{token}', [CustomerAuthController::class, 'showResetPassword'])
            ->name('password.reset');

        Route::post('/reset-password', [CustomerAuthController::class, 'resetPassword'])
            ->name('password.update');
    });

    // Email Verification Notice
    Route::get('/customer/verify-email', function () {
        return Inertia::render('Customer/Auth/VerifyEmail');
    })->middleware(['auth:customer'])->name('customer.verification.notice');

    // Email Verification Handler
    Route::get('/customer/verify-email/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();
        return redirect()->route('customer.dashboard');
    })->middleware(['auth:customer', 'signed'])->name('customer.verification.verify');

    // Resend Verification Email
    Route::post('/customer/email/verification-notification', function (Request $request) {
        $request->user('customer')->sendEmailVerificationNotification();
        return back()->with('status', 'verification-link-sent');
    })->middleware(['auth:customer', 'throttle:6,1'])->name('customer.verification.send');

    // Authenticated customer routes
    Route::middleware(['auth:customer'])->group(function () {
        // Logout
        Route::post('/logout', [CustomerAuthController::class, 'logout'])
            ->name('logout');

        // Dashboard
        Route::get('/dashboard', [CustomerDashboardController::class, 'index'])->name('dashboard');

        // Add more customer routes here...
    });
});

Route::name('staff.')->prefix('staff')->group(function () {
    Route::middleware('auth:staff')->group(function () {
        Route::get('/dashboard', [StaffDashboardController::class, 'index'])->name('dashboard');

        Route::get('/generate-offline', [StaffDashboardController::class, 'generateOfflineStamps'])->name('generate-offline');
        Route::post('/perk-claims/{perkClaim}/redeem', [StaffDashboardController::class, 'markAsRedeemed'])->name('perk-claims.redeem');
        Route::post('/perk-claims/{perkClaim}/undo', [StaffDashboardController::class, 'undoRedeem'])->name('perk-claims.undo');

        Route::post('/logout', [StaffAuthController::class, 'logout'])
            ->name('logout');
    });

    Route::middleware('guest:staff')->group(function () {
        Route::get('/login', [StaffAuthController::class, 'index'])
            ->name('login');

        Route::post('/login', [StaffAuthController::class, 'login']);
    });
});




require __DIR__ . '/settings.php';
