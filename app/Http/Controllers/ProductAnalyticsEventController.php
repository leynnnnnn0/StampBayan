<?php

namespace App\Http\Controllers;

use App\Models\ProductAnalyticsEvent;
use Illuminate\Http\Request;

class ProductAnalyticsEventController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_name' => ['required', 'string', 'max:80'],
            'session_id' => ['nullable', 'string', 'max:120'],
            'path' => ['nullable', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:2048'],
            'referrer' => ['nullable', 'string', 'max:2048'],
            'page_title' => ['nullable', 'string', 'max:255'],
            'element_label' => ['nullable', 'string', 'max:255'],
            'duration_ms' => ['nullable', 'integer', 'min:0', 'max:86400000'],
            'metadata' => ['nullable', 'array'],
        ]);

        $user = $request->user();
        $customer = $request->user('customer');
        $staff = $request->user('staff');
        $businessId = $user?->business?->id ?? $customer?->business_id ?? $staff?->business_id;

        ProductAnalyticsEvent::create([
            ...$validated,
            'user_id' => $user?->id,
            'business_id' => $businessId,
            'customer_id' => $customer?->id,
            'staff_id' => $staff?->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->noContent();
    }
}
