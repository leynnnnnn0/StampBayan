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
        $businessId = $business->id;
        $startOfMonth = now()->startOfMonth();
        $startOfLastMonth = now()->subMonth()->startOfMonth();
        $endOfLastMonth = now()->subMonth()->endOfMonth();
        $startOfWeek = now()->startOfWeek();
        $today = today();
        
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
            
        $stampsUsedCountThisMonth = (int) $business->stampCodes()
            ->whereNotNull('used_at')
            ->where('used_at', '>=', $startOfMonth)
            ->sum('number_of_stamps');
            
        $stampsUsedLastMonth = (int) $business->stampCodes()
            ->whereNotNull('used_at')
            ->whereBetween('used_at', [$startOfLastMonth, $endOfLastMonth])
            ->sum('number_of_stamps');
            
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
            ->map(fn($stamps) => $stamps->sum('number_of_stamps'));

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

        $activeCustomersThisMonth = $business->stampCodes()
            ->whereNotNull('used_at')
            ->where('used_at', '>=', $startOfMonth)
            ->whereNotNull('customer_id')
            ->distinct('customer_id')
            ->count('customer_id');

        $returningCustomersThisMonth = DB::table('stamp_codes as current_stamps')
            ->where('current_stamps.business_id', $businessId)
            ->whereNull('current_stamps.deleted_at')
            ->whereNotNull('current_stamps.used_at')
            ->where('current_stamps.used_at', '>=', $startOfMonth)
            ->whereNotNull('current_stamps.customer_id')
            ->whereExists(function ($query) use ($startOfMonth) {
                $query->select(DB::raw(1))
                    ->from('stamp_codes as previous_stamps')
                    ->whereColumn('previous_stamps.customer_id', 'current_stamps.customer_id')
                    ->whereNull('previous_stamps.deleted_at')
                    ->whereNotNull('previous_stamps.used_at')
                    ->where('previous_stamps.used_at', '<', $startOfMonth);
            })
            ->distinct('current_stamps.customer_id')
            ->count('current_stamps.customer_id');

        $inactiveCustomers = DB::table('customers')
            ->leftJoinSub(
                DB::table('stamp_codes')
                    ->select('customer_id', DB::raw('MAX(used_at) as last_used_at'))
                    ->where('business_id', $businessId)
                    ->whereNull('deleted_at')
                    ->whereNotNull('used_at')
                    ->groupBy('customer_id'),
                'last_activity',
                'customers.id',
                '=',
                'last_activity.customer_id'
            )
            ->where('customers.business_id', $businessId)
            ->selectRaw("
                SUM(CASE WHEN last_activity.last_used_at IS NULL OR last_activity.last_used_at < ? THEN 1 ELSE 0 END) as inactive_30,
                SUM(CASE WHEN last_activity.last_used_at IS NULL OR last_activity.last_used_at < ? THEN 1 ELSE 0 END) as inactive_60,
                SUM(CASE WHEN last_activity.last_used_at IS NULL OR last_activity.last_used_at < ? THEN 1 ELSE 0 END) as inactive_90
            ", [now()->subDays(30), now()->subDays(60), now()->subDays(90)])
            ->first();

        $newVsReturningCustomers = collect(range(5, 0))->map(function ($monthsAgo) use ($businessId) {
            $month = now()->subMonths($monthsAgo);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();

            $activeCustomerIds = DB::table('stamp_codes')
                ->where('business_id', $businessId)
                ->whereNull('deleted_at')
                ->whereNotNull('used_at')
                ->whereBetween('used_at', [$monthStart, $monthEnd])
                ->whereNotNull('customer_id')
                ->distinct()
                ->pluck('customer_id');

            $returning = $activeCustomerIds->isEmpty()
                ? 0
                : DB::table('stamp_codes')
                    ->where('business_id', $businessId)
                    ->whereNull('deleted_at')
                    ->whereNotNull('used_at')
                    ->where('used_at', '<', $monthStart)
                    ->whereIn('customer_id', $activeCustomerIds)
                    ->distinct('customer_id')
                    ->count('customer_id');

            return [
                'month' => $month->format('M'),
                'new' => max($activeCustomerIds->count() - $returning, 0),
                'returning' => $returning,
            ];
        });

        $stampsIssuedToday = (int) $business->stampCodes()
            ->whereNotNull('used_at')
            ->whereDate('used_at', $today)
            ->sum('number_of_stamps');

        $stampsIssuedThisWeek = (int) $business->stampCodes()
            ->whereNotNull('used_at')
            ->where('used_at', '>=', $startOfWeek)
            ->sum('number_of_stamps');

        $averageStampsPerCustomer = $activeCustomersThisMonth > 0
            ? round($stampsUsedCountThisMonth / $activeCustomersThisMonth, 1)
            : 0;

        $dailyStampTrend = collect(range(13, 0))->map(function ($daysAgo) use ($business) {
            $date = today()->subDays($daysAgo);

            return [
                'date' => $date->format('M j'),
                'stamps' => (int) $business->stampCodes()
                    ->whereNotNull('used_at')
                    ->whereDate('used_at', $date)
                    ->sum('number_of_stamps'),
            ];
        });

        $topLoyaltyCards = DB::table('stamp_codes')
            ->join('loyalty_cards', 'stamp_codes.loyalty_card_id', '=', 'loyalty_cards.id')
            ->where('stamp_codes.business_id', $businessId)
            ->whereNull('stamp_codes.deleted_at')
            ->whereNotNull('stamp_codes.used_at')
            ->where('stamp_codes.used_at', '>=', now()->subDays(30))
            ->groupBy('loyalty_cards.id', 'loyalty_cards.name')
            ->orderByDesc(DB::raw('SUM(stamp_codes.number_of_stamps)'))
            ->limit(5)
            ->get([
                'loyalty_cards.name',
                DB::raw('SUM(stamp_codes.number_of_stamps) as stamps'),
            ]);

        $rewardStats = DB::table('perk_claims')
            ->join('loyalty_cards', 'perk_claims.loyalty_card_id', '=', 'loyalty_cards.id')
            ->where('loyalty_cards.business_id', $businessId)
            ->selectRaw("
                COUNT(CASE WHEN perk_claims.created_at >= ? THEN 1 END) as unlocked_this_month,
                COUNT(CASE WHEN perk_claims.is_redeemed = 1 AND perk_claims.redeemed_at >= ? THEN 1 END) as redeemed_this_month,
                COUNT(CASE WHEN perk_claims.is_redeemed = 0 THEN 1 END) as unclaimed,
                COUNT(*) as total_unlocked,
                COUNT(CASE WHEN perk_claims.is_redeemed = 1 THEN 1 END) as total_redeemed
            ", [$startOfMonth, $startOfMonth])
            ->first();

        $redemptionRate = $rewardStats->total_unlocked > 0
            ? round(($rewardStats->total_redeemed / $rewardStats->total_unlocked) * 100, 1)
            : 0;

        $popularPerks = DB::table('perk_claims')
            ->join('perks', 'perk_claims.perk_id', '=', 'perks.id')
            ->join('loyalty_cards', 'perk_claims.loyalty_card_id', '=', 'loyalty_cards.id')
            ->where('loyalty_cards.business_id', $businessId)
            ->groupBy('perks.id', 'perks.reward')
            ->orderByDesc(DB::raw('COUNT(*)'))
            ->limit(5)
            ->get([
                'perks.reward',
                DB::raw('COUNT(*) as unlocked'),
                DB::raw('SUM(CASE WHEN perk_claims.is_redeemed = 1 THEN 1 ELSE 0 END) as redeemed'),
            ]);

        $customerProgressRows = DB::table('stamp_codes')
            ->join('loyalty_cards', 'stamp_codes.loyalty_card_id', '=', 'loyalty_cards.id')
            ->where('stamp_codes.business_id', $businessId)
            ->whereNull('stamp_codes.deleted_at')
            ->whereNotNull('stamp_codes.used_at')
            ->whereNotNull('stamp_codes.customer_id')
            ->groupBy('stamp_codes.customer_id', 'stamp_codes.loyalty_card_id', 'loyalty_cards.stampsNeeded')
            ->get([
                'stamp_codes.customer_id',
                'stamp_codes.loyalty_card_id',
                'loyalty_cards.stampsNeeded',
                DB::raw('SUM(stamp_codes.number_of_stamps) as stamps'),
            ]);

        $averageCompletionProgress = $customerProgressRows->count() > 0
            ? round($customerProgressRows->avg(fn ($row) => min(($row->stamps / max($row->stampsNeeded, 1)) * 100, 100)), 1)
            : 0;

        $customersCloseToCompletion = $customerProgressRows
            ->filter(fn ($row) => $row->stampsNeeded > 0 && ($row->stamps / $row->stampsNeeded) >= 0.8)
            ->unique('customer_id')
            ->count();

        $completedCardsThisMonth = DB::table('completed_loyalty_cards')
            ->join('loyalty_cards', 'completed_loyalty_cards.loyalty_card_id', '=', 'loyalty_cards.id')
            ->where('loyalty_cards.business_id', $businessId)
            ->where('completed_loyalty_cards.completed_at', '>=', $startOfMonth)
            ->count();

        $repeatCompletions = DB::table('completed_loyalty_cards')
            ->join('loyalty_cards', 'completed_loyalty_cards.loyalty_card_id', '=', 'loyalty_cards.id')
            ->where('loyalty_cards.business_id', $businessId)
            ->where('completed_loyalty_cards.card_cycle', '>', 1)
            ->count();

        return Inertia::render('Business/Dashboard/Index', [
            'customersCount' => $customersCount,
            'newCustomersThisMonth' => $newCustomersThisMonth,
            'percentageChange' => round($percentageChange, 1),
            'stampsUsedCountThisMonth' => $stampsUsedCountThisMonth,
            'percentageChangeOnStamps' => round($percentageChangeOnStamps, 1),
            'stampsByDayOfWeek' => $stampsByDay,
            'repeatCustomerRate' => $repeatCustomerRate,
            'customerRetention' => [
                'activeThisMonth' => $activeCustomersThisMonth,
                'returningThisMonth' => $returningCustomersThisMonth,
                'inactive30' => (int) ($inactiveCustomers->inactive_30 ?? 0),
                'inactive60' => (int) ($inactiveCustomers->inactive_60 ?? 0),
                'inactive90' => (int) ($inactiveCustomers->inactive_90 ?? 0),
                'newVsReturning' => $newVsReturningCustomers,
            ],
            'stampActivity' => [
                'today' => $stampsIssuedToday,
                'thisWeek' => $stampsIssuedThisWeek,
                'thisMonth' => $stampsUsedCountThisMonth,
                'averagePerCustomer' => $averageStampsPerCustomer,
                'dailyTrend' => $dailyStampTrend,
                'topLoyaltyCards' => $topLoyaltyCards,
            ],
            'rewardPerformance' => [
                'unlockedThisMonth' => (int) ($rewardStats->unlocked_this_month ?? 0),
                'redeemedThisMonth' => (int) ($rewardStats->redeemed_this_month ?? 0),
                'unclaimed' => (int) ($rewardStats->unclaimed ?? 0),
                'redemptionRate' => $redemptionRate,
                'popularPerks' => $popularPerks,
            ],
            'customerProgress' => [
                'closeToCompletion' => $customersCloseToCompletion,
                'averageCompletionProgress' => $averageCompletionProgress,
                'completedThisMonth' => $completedCardsThisMonth,
                'repeatCompletions' => $repeatCompletions,
            ],
        ]);
    }
}
