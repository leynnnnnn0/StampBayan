<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

use Illuminate\Support\Facades\Hash;



class StaffAuthController extends Controller
{

    public function index()
    {
        return Inertia::render('Staff/Auth/Login', [
            'status' => session('status'),
        ]);
    }
    public function logout(Request $request)
    {
        Auth::guard('staff')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('staff.login');
    }

    public function login(Request $request)
    {
        $this->checkTooManyFailedAttempts($request);

        $credentials = $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $staff = \App\Models\Staff::where('username', $credentials['username'])->first();

        if (!$staff || !$staff->is_active) {
            RateLimiter::hit($this->throttleKey($request));

            throw ValidationException::withMessages([
                'username' => __('auth.failed'),
            ]);
        }

        // Proceed with authentication
        if (Auth::guard('staff')->attempt(
            $credentials,
            true
        )) {
            $request->session()->regenerate();
            RateLimiter::clear($this->throttleKey($request));

            return redirect()->intended(route('staff.dashboard'));
        }

        RateLimiter::hit($this->throttleKey($request));

        throw ValidationException::withMessages([
            'username' => __('auth.failed'),
        ]);
    }

    protected function throttleKey(Request $request): string
    {
        return strtolower($request->input('username')) . '|' . $request->ip();
    }


    protected function checkTooManyFailedAttempts(Request $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'username' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }
}
