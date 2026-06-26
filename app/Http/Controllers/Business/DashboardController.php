<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    //test
    public function index()
    {
        $business = Auth::user()->business;
        
        // Existing calculations
        $customersCount = $business->customers()->count();

        $newCustomersThisMonth = $business->customers()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
            
        $newCustomersLastMonth = $business->customers()
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();
            
        $percentageChange = $newCustomersLastMonth > 0
            ? (($newCustomersThisMonth - $newCustomersLastMonth) / $newCustomersLastMonth) * 100
            : ($newCustomersThisMonth > 0 ? 100 : 0);
            
        $stampsUsedCountThisMonth = $business->stampCodes()
            ->whereNotNull('used_at')
            ->whereMonth('used_at', now()->month)
            ->whereYear('used_at', now()->year)
            ->count();
            
        $stampsUsedLastMonth = $business->stampCodes()
            ->whereNotNull('used_at')
            ->whereMonth('used_at', now()->subMonth()->month)
            ->whereYear('used_at', now()->subMonth()->year)
            ->count();
            
        $percentageChangeOnStamps = $stampsUsedLastMonth > 0
            ? (($stampsUsedCountThisMonth - $stampsUsedLastMonth) / $stampsUsedLastMonth) * 100
            : ($stampsUsedCountThisMonth > 0 ? 100 : 0);

        // Stamps by day of week (last 30 days)
        $stampsByDayOfWeek = $business->stampCodes()
            ->whereNotNull('used_at')
            ->where('used_at', '>=', now()->subDays(30))
            ->select('used_at')
            ->get()
            ->groupBy(fn($stamp) => \Illuminate\Support\Carbon::parse($stamp->used_at)->format('l'))
            ->map(fn($stamps) => $stamps->count());

        $daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $stampsByDay = collect($daysOfWeek)->map(function($day) use ($stampsByDayOfWeek) {
            return [
                'day' => $day,
                'stamps' => $stampsByDayOfWeek[$day] ?? 0
            ];
        })->values();

        // NEW: Customer visit frequency - last 8 weeks
        $repeatCustomerRate = collect(range(7, 0))->map(function($weeksAgo) use ($business) {
            $startOfWeek = now()->subWeeks($weeksAgo)->startOfWeek();
            $endOfWeek = now()->subWeeks($weeksAgo)->endOfWeek();
            
            // Get all customers who used stamps this week
            $customersThisWeek = $business->stampCodes()
                ->whereNotNull('used_at')
                ->whereBetween('used_at', [$startOfWeek, $endOfWeek])
                ->pluck('customer_id')
                ->unique();
            
            // Count visits per customer for this week
            $visitCounts = $business->stampCodes()
                ->whereNotNull('used_at')
                ->whereBetween('used_at', [$startOfWeek, $endOfWeek])
                ->whereIn('customer_id', $customersThisWeek)
                ->select('customer_id', DB::raw('COUNT(DISTINCT DATE(used_at)) as visit_count'))
                ->groupBy('customer_id')
                ->get();
            
            // Categorize by visit frequency
            $oneVisit = $visitCounts->where('visit_count', 1)->count();
            $twoToFive = $visitCounts->whereBetween('visit_count', [2, 5])->count();
            $sixPlus = $visitCounts->where('visit_count', '>=', 6)->count();
            
            return [
                'week' => 'Week ' . (8 - $weeksAgo),
                'oneVisit' => $oneVisit,
                'twoToFive' => $twoToFive,
                'sixPlus' => $sixPlus
            ];
        });

        return Inertia::render('Business/Dashboard/Index', [
            'customersCount' => $customersCount,
            'newCustomersThisMonth' => $newCustomersThisMonth,
            'percentageChange' => round($percentageChange, 1),
            'stampsUsedCountThisMonth' => $stampsUsedCountThisMonth,
            'percentageChangeOnStamps' => round($percentageChangeOnStamps, 1),
            'stampsByDayOfWeek' => $stampsByDay,
            'repeatCustomerRate' => $repeatCustomerRate
        ]);
    }
}
