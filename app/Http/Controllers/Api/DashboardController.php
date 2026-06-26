<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Customer;
use App\Models\Staff;
use App\Models\StampCode;
use App\Models\Suggestion;
use App\Models\Ticket;
use Exception;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $businesses = Business::where('id', '!=', 1)->count();
            $staffs = Staff::count();
            $customers = Customer::where('business_id', '!=', 1)->count();
            $stampsGiven = StampCode::where('used_at', '!=', null)->where('business_id', '!=', 1)->count();
            $openTickets = Ticket::where('status', 'open')->count();
            $suggestions = Suggestion::count();

            return response()->json([
                'success' => true,
                'data' => [ 
                    'businesses' => $businesses,
                    'staffs' => $staffs,
                    'customers' => $customers,
                    'stamps_given' => $stampsGiven,
                    'open_tickets' => $openTickets,
                    'suggestions' => $suggestions,
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getBusinesses()
    {
        try {
            $businesses = Business::with('user')
                ->withCount(['customers', 'staffs'])
                ->where('id', '!=', 1)
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $businesses->map(function ($business) {
                    return [
                        'id' => $business->id,
                        'name' => $business->name,
                        'user' => $business->user->id,
                        'customers' => $business->customers_count,
                        'staffs' => $business->staffs_count,
                        'created_at' => $business->created_at,
                    ];
                })
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch businesses data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getBusiness($id)
    {
        try {
            $business = Business::with([
                    'user',
                    'staffs',
                    'customers' => fn ($query) => $query->withCount('stamp_codes'),
                ])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $business->id,
                    'name' => $business->name,
                    'user' => $business->user->id,
                    'created_at' => $business->created_at,
                    'customers' => $business->customers->map(function($customer){
                        return [
                            'id' => $customer->id,
                            'name' => $customer->username,
                            'email' => $customer->email,
                            'phone' => $customer->phone,
                            'stamp_codes' => $customer->stamp_codes_count,
                            'created_at' => $customer->created_at,
                        ];
                    }),
                    'staffs' => $business->staffs->map(function($staff){
                        return [
                            'id' => $staff->id,
                            'username' => $staff->username,
                            'is_active' => $staff->is_active,
                            'created_at' => $staff->created_at,
                        ];
                    })
                ]
            ], 200);
        }catch(Exception $e){
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
