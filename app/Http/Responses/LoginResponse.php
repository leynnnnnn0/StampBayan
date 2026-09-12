<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $home = $request->user()?->role === 'admin'
            ? route('home')
            : config('fortify.home');

        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->intended($home);
    }
}
