<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $customers = Customer::where('business_id', Auth::user()->business->id)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Business/Customer/Index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function show($id)
    {
        $customer = Customer::where('business_id', Auth::user()->business->id)
            ->findOrFail($id);

        $customer->setAttribute(
            'total_stamps',
            (int) $customer->stamp_codes()
                ->withoutTrashed()
                ->whereNotNull('used_at')
                ->sum('number_of_stamps')
        );

        return Inertia::render('Business/Customer/Show', [
            'customer' => $customer,
            'stampCodes' => $customer->stamp_codes()
                ->with('loyalty_card')
                ->orderByDesc('id')
                ->paginate(10)
                ->withQueryString(),
        ]);
    }
}
