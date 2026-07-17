<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\StampCode;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $startOfMonth = now()->startOfMonth();
        $last30Days = now()->subDays(30);
        $activeSessionCutoff = now()->subMinutes(30)->timestamp;

        $totalSignups = User::count();
        $signupsThisMonth = User::where('created_at', '>=', $startOfMonth)->count();
        $activeUsers = DB::table('sessions')
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', $activeSessionCutoff)
            ->distinct('user_id')
            ->count('user_id');

        $totalBusinesses = Business::count();
        $totalCustomers = Customer::count();
        $newCustomersThisMonth = Customer::where('created_at', '>=', $startOfMonth)->count();
        $totalStamps = (int) StampCode::whereNotNull('used_at')->sum('number_of_stamps');
        $totalLoyaltyCards = LoyaltyCard::count();
        $averageStampsPerDay = round(
            ((int) StampCode::whereNotNull('used_at')->where('used_at', '>=', $last30Days)->sum('number_of_stamps')) / 30,
            1
        );

        $customerCounts = DB::table('customers')
            ->select('business_id')
            ->selectRaw('COUNT(*) as customers_count')
            ->selectRaw('SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as new_customers_count', [$startOfMonth])
            ->groupBy('business_id');

        $stampCounts = DB::table('stamp_codes')
            ->select('business_id')
            ->whereNull('deleted_at')
            ->whereNotNull('used_at')
            ->selectRaw('COALESCE(SUM(number_of_stamps), 0) as stamps_count')
            ->selectRaw('COALESCE(SUM(CASE WHEN used_at >= ? THEN number_of_stamps ELSE 0 END), 0) as stamps_last_30_days', [$last30Days])
            ->selectRaw('COUNT(DISTINCT customer_id) as active_customers_count')
            ->groupBy('business_id');

        $loyaltyCardCounts = DB::table('loyalty_cards')
            ->select('business_id')
            ->selectRaw('COUNT(*) as loyalty_cards_count')
            ->groupBy('business_id');

        $businesses = DB::table('businesses')
            ->join('users', 'businesses.user_id', '=', 'users.id')
            ->leftJoinSub($customerCounts, 'customer_counts', 'businesses.id', '=', 'customer_counts.business_id')
            ->leftJoinSub($stampCounts, 'stamp_counts', 'businesses.id', '=', 'stamp_counts.business_id')
            ->leftJoinSub($loyaltyCardCounts, 'loyalty_card_counts', 'businesses.id', '=', 'loyalty_card_counts.business_id')
            ->select([
                'businesses.id',
                'businesses.name',
                'businesses.created_at',
                'users.username as owner_username',
                'users.email as owner_email',
                DB::raw('COALESCE(customer_counts.customers_count, 0) as customers_count'),
                DB::raw('COALESCE(customer_counts.new_customers_count, 0) as new_customers_count'),
                DB::raw('COALESCE(stamp_counts.stamps_count, 0) as stamps_count'),
                DB::raw('COALESCE(stamp_counts.stamps_last_30_days, 0) as stamps_last_30_days'),
                DB::raw('COALESCE(stamp_counts.active_customers_count, 0) as active_customers_count'),
                DB::raw('COALESCE(loyalty_card_counts.loyalty_cards_count, 0) as loyalty_cards_count'),
            ])
            ->orderByDesc('businesses.created_at')
            ->limit(100)
            ->get()
            ->map(fn ($business) => [
                'id' => $business->id,
                'name' => $business->name,
                'owner_username' => $business->owner_username,
                'owner_email' => $business->owner_email,
                'customers_count' => (int) $business->customers_count,
                'new_customers_count' => (int) $business->new_customers_count,
                'stamps_count' => (int) $business->stamps_count,
                'stamps_last_30_days' => (int) $business->stamps_last_30_days,
                'active_customers_count' => (int) $business->active_customers_count,
                'loyalty_cards_count' => (int) $business->loyalty_cards_count,
                'average_stamps_per_day' => round(((int) $business->stamps_last_30_days) / 30, 1),
                'created_at' => $business->created_at,
            ]);

        return Inertia::render('Admin/Dashboard/Index', [
            'summary' => [
                'totalSignups' => $totalSignups,
                'signupsThisMonth' => $signupsThisMonth,
                'activeUsers' => $activeUsers,
                'totalBusinesses' => $totalBusinesses,
                'totalCustomers' => $totalCustomers,
                'newCustomersThisMonth' => $newCustomersThisMonth,
                'totalStamps' => $totalStamps,
                'totalLoyaltyCards' => $totalLoyaltyCards,
                'averageStampsPerDay' => $averageStampsPerDay,
            ],
            'businesses' => $businesses,
        ]);
    }
}
