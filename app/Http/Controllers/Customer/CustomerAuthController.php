<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Business;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CustomerAuthController extends Controller
{
    /**
     * Show login form
     */
    public function index(Request $request)
    {
        $isDemo = $request->query('data') ? $request->query('data')['is_demo'] : false;

        // Optional: Get business from query parameter or subdomain
        $businessId = $request->query('token');
        $business = $businessId ? Business::where('qr_token', $businessId)->firstOrFail() : null;

        return Inertia::render('Customer/Auth/Login', [
            'business' => $business,
            'status' => session('status'),
            'isDemo' => $isDemo
        ]);
    }

    /**
     * Handle login with rate limiting
     */
    public function login(Request $request)
    {
     
        $this->checkTooManyFailedAttempts($request);

        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::guard('customer')->attempt(
            $credentials, 
            true
        )) {
            $request->session()->regenerate();
            RateLimiter::clear($this->throttleKey($request));
            
            return redirect()->intended(route('customer.dashboard'));
        }

        RateLimiter::hit($this->throttleKey($request));

        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    /**
     * Show registration form
     */
    public function showRegister(Request $request)
    {

        // Optional: Pre-select business from query parameter
        $businessId = $request->query('business');
        $selectedBusiness = Business::where('qr_token', $businessId)->firstOrFail();

        return Inertia::render('Customer/Auth/Register', [
            'selectedBusiness' => $selectedBusiness,
        ]);
    }

    /**
     * Handle registration
     */
    public function register(Request $request)
    {   
        $validated = $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'username' => 'required|string|max:255|unique:customers,username',
            'email' => 'required|email|unique:customers,email',
            'password' => 'required|min:8|confirmed',
        ]);

        $customer = Customer::create([
            'business_id' => $validated['business_id'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        Auth::guard('customer')->login($customer, true);

        return redirect()->route('customer.dashboard');
    }

    /**
     * Handle logout
     */
    public function logout(Request $request)
    {
        Auth::guard('customer')->logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect()->route('customer.login');
    }

    /**
     * Get the rate limiting throttle key
     */
    protected function throttleKey(Request $request): string
    {
        return strtolower($request->input('email')) . '|' . $request->ip();
    }

    /**
     * Check if too many failed login attempts
     */
    protected function checkTooManyFailedAttempts(Request $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            return;
        } 

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

     /**
     * Show forgot password form
     */
    public function showForgotPassword()
    {
        return Inertia::render('Customer/Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle forgot password request
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Rate limiting for reset link requests
        $throttleKey = 'password-reset:' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            
            throw ValidationException::withMessages([
                'email' => trans('passwords.throttled', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        $status = Password::broker('customers')->sendResetLink(
            $request->only('email')
        );

        RateLimiter::hit($throttleKey, 60); // 1 minute cooldown

        if ($status === Password::RESET_LINK_SENT) {
            return back()->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    /**
     * Show reset password form
     */
    public function showResetPassword(Request $request, string $token)
    {
        return Inertia::render('Customer/Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $token,
        ]);
    }

    /**
     * Handle password reset
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::broker('customers')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (Customer $customer, string $password) {
                $customer->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $customer->save();

                event(new PasswordReset($customer));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('customer.login')->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    public function getGuide()
    {
        return Inertia::render('Customer/Auth/Guide');
    }

}
