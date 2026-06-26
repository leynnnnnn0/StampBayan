<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();

    
})->middleware('auth:sanctum');

Route::controller(App\Http\Controllers\Api\DashboardController::class)->group(function () {
    Route::get('/dashboard', 'index');
    Route::get('/businesses', 'getBusinesses');
    Route::get('/business/{id}', 'getBusiness');
});
