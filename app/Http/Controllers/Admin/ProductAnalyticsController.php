<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\ProductAnalyticsEvent;
use App\Models\StampCode;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductAnalyticsController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        abort_unless($user && ($user->id === 1 || $user->role === 'admin'), 403);

        $since = now()->subDays(30);
        $businesses = Business::with('user')
            ->withCount(['loyaltyCards', 'customers'])
            ->withCount([
                'stampCodes as used_stamps_count' => fn ($query) => $query->whereNotNull('used_at'),
            ])
            ->latest()
            ->get();

        $totalBusinesses = $businesses->count();
        $activeBusinessIds = StampCode::whereNotNull('used_at')
            ->where('used_at', '>=', $since)
            ->distinct()
            ->pluck('business_id');
        $activeBusinesses = $activeBusinessIds->count();
        $activationRate = $totalBusinesses > 0 ? round(($activeBusinesses / $totalBusinesses) * 100, 1) : 0;

        $dashboardVisitors = ProductAnalyticsEvent::where('path', 'like', '/business/dashboard%')
            ->whereNotNull('business_id')
            ->distinct()
            ->count('business_id');
        $createdCards = LoyaltyCard::distinct()->count('business_id');
        $issuedStamps = StampCode::whereNotNull('used_at')->distinct()->count('business_id');
        $registeredCustomers = Customer::distinct()->count('business_id');

        $funnel = $this->buildFunnel([
            ['label' => 'Business sign ups', 'count' => $totalBusinesses],
            ['label' => 'Visited dashboard', 'count' => $dashboardVisitors],
            ['label' => 'Created loyalty card', 'count' => $createdCards],
            ['label' => 'Issued first stamp', 'count' => $issuedStamps],
            ['label' => 'Has customer account', 'count' => $registeredCustomers],
            ['label' => 'Active in last 30 days', 'count' => $activeBusinesses],
        ]);

        $topPages = ProductAnalyticsEvent::where('event_name', 'page_view')
            ->where('created_at', '>=', $since)
            ->select('path', DB::raw('count(*) as views'))
            ->groupBy('path')
            ->orderByDesc('views')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'path' => $row->path ?: 'Unknown',
                'views' => (int) $row->views,
            ]);

        $topClicks = ProductAnalyticsEvent::where('event_name', 'click')
            ->where('created_at', '>=', $since)
            ->select('element_label', 'path', DB::raw('count(*) as clicks'))
            ->groupBy('element_label', 'path')
            ->orderByDesc('clicks')
            ->limit(12)
            ->get()
            ->map(fn ($row) => [
                'label' => $row->element_label ?: 'Unlabeled action',
                'path' => $row->path ?: 'Unknown',
                'clicks' => (int) $row->clicks,
            ]);

        $timeByPage = ProductAnalyticsEvent::where('event_name', 'page_duration')
            ->where('created_at', '>=', $since)
            ->whereNotNull('duration_ms')
            ->select('path', DB::raw('avg(duration_ms) as avg_duration_ms'), DB::raw('count(*) as samples'))
            ->groupBy('path')
            ->orderByDesc('samples')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'path' => $row->path ?: 'Unknown',
                'average_seconds' => round(((float) $row->avg_duration_ms) / 1000, 1),
                'samples' => (int) $row->samples,
            ]);

        $dropOffPages = ProductAnalyticsEvent::whereIn('event_name', ['page_view', 'page_duration'])
            ->where('created_at', '>=', $since)
            ->whereNotNull('session_id')
            ->orderBy('session_id')
            ->orderBy('created_at')
            ->get(['session_id', 'path', 'created_at'])
            ->groupBy('session_id')
            ->map(fn ($session) => $session->last())
            ->filter()
            ->groupBy('path')
            ->map(fn ($items, $path) => [
                'path' => $path ?: 'Unknown',
                'exits' => $items->count(),
            ])
            ->sortByDesc('exits')
            ->take(10)
            ->values();

        $businessProgress = $businesses->take(40)->map(function (Business $business) {
            $lastEvent = ProductAnalyticsEvent::where('business_id', $business->id)->latest()->first();
            $firstStampAt = StampCode::where('business_id', $business->id)
                ->whereNotNull('used_at')
                ->min('used_at');
            $stage = 'Active';

            if ($business->loyalty_cards_count === 0) {
                $stage = 'Needs card';
            } elseif ($business->customers_count === 0) {
                $stage = 'Needs customers';
            } elseif ($business->used_stamps_count === 0) {
                $stage = 'Needs first stamp';
            }

            return [
                'id' => $business->id,
                'name' => $business->name,
                'owner_email' => $business->user?->email,
                'signed_up_at' => $business->created_at?->toDateTimeString(),
                'days_since_signup' => $business->created_at?->diffInDays(now()),
                'created_cards' => $business->loyalty_cards_count,
                'customers' => $business->customers_count,
                'used_stamps' => $business->used_stamps_count,
                'first_stamp_at' => $firstStampAt,
                'last_seen_at' => $lastEvent?->created_at?->toDateTimeString(),
                'last_seen_path' => $lastEvent?->path,
                'stage' => $stage,
            ];
        });

        return Inertia::render('Admin/ProductAnalytics/Index', [
            'summary' => [
                'total_businesses' => $totalBusinesses,
                'active_businesses' => $activeBusinesses,
                'activation_rate' => $activationRate,
                'total_customers' => Customer::count(),
                'used_stamps_30_days' => StampCode::whereNotNull('used_at')->where('used_at', '>=', $since)->count(),
            ],
            'funnel' => $funnel,
            'topPages' => $topPages,
            'topClicks' => $topClicks,
            'timeByPage' => $timeByPage,
            'dropOffPages' => $dropOffPages,
            'businessProgress' => $businessProgress,
        ]);
    }

    private function buildFunnel(array $steps): array
    {
        return collect($steps)->map(function ($step, $index) use ($steps) {
            $previous = $index === 0 ? $step['count'] : $steps[$index - 1]['count'];
            $conversion = $index === 0
                ? 100
                : ($previous > 0 ? min(100, round(($step['count'] / $previous) * 100, 1)) : 0);

            return [
                'label' => $step['label'],
                'count' => $step['count'],
                'conversion' => $conversion,
                'dropoff' => $index === 0 ? 0 : max(0, $steps[$index - 1]['count'] - $step['count']),
            ];
        })->all();
    }
}
