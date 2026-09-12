<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // Redirect based on the guard
                return match($guard) {
                    'customer' => redirect()->route('customer.dashboard'),
                    'staff' => redirect()->route('staff.dashboard'),
                    default => $request->user()?->role === 'admin'
                        ? redirect()->route('home')
                        : redirect()->route('dashboard'), // business
                };
            }
        }

        return $next($request);
    }
}
