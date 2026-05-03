<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyCard;
use App\Models\StampCode;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class IssueStampController extends Controller
{
    public function index(Request $request)
    {
        $cards = LoyaltyCard::where('business_id', Auth::user()->business->id)
            ->whereDate('valid_until', '>', today())
            ->select('id', 'name')
            ->get();

        // Generate code if loyalty_card_id is provided
        if ($request->has('loyalty_card_id') && $request->has('number_of_stamps') && $request->input('number_of_stamps') > 0) {
            $loyaltyCardId = $request->input('loyalty_card_id');

            // Validate that the card belongs to this business
            $cardExists = $cards->contains('id', $loyaltyCardId);

            if ($cardExists) {
                $code = $this->generate($loyaltyCardId, $request->input('number_of_stamps'));
            } else {
                $code = [
                    'success' => false,
                    'code' => '',
                    'qr_url' => '',
                    'created_at' => ''
                ];
            }
        } else {
            $code = [
                'success' => false,
                'code' => '',
                'qr_url' => '',
                'created_at' => ''
            ];
        }
      

        return Inertia::render('Business/IssueStamp/Index', [
            'code' => $code,
            'cards' => $cards,
            'loyalty_card_id' => $request->input('loyalty_card_id', null),
        ]);
    }

    private function generate($loyaltyCardId, $numberOfStamps)
    {
        // Expire old unused codes
        StampCode::whereNull('used_at')
            ->where('created_at', '<=', Carbon::now()->subMinutes(15))
            ->where('is_offline_code', false)
            ->update([
                'is_expired' => true
            ]);

        // Generate unique code
        do {
            $code = strtoupper(Str::random(8));
        } while (StampCode::where('code', $code)->exists());

        // Create stamp code
        $stampCode = StampCode::create([
            'user_id' => Auth::id(),
            'business_id' => Auth::user()->business->id,
            'customer_id' => null,
            'loyalty_card_id' => $loyaltyCardId,
            'code' => $code,
            'used_at' => null,
            'is_expired' => false,
            'number_of_stamps' => $numberOfStamps,
        ]);



        return [
            'success' => true,
            'code' => $stampCode->code,
            'qr_url' => "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data={$stampCode->code}",
            'created_at' => $stampCode->created_at->format('M d, Y h:i A'),
            'number_of_stamps' => $stampCode->number_of_stamps,
        ];
    }



    public function generateOfflineStamps(Request $request)
    {
        $business = Auth::user()->business;
        $loyaltyCardId = $request->input('id');
        $registrationLink = $business->subdomain ? $business->subdomain : 'https://stampbayan.com/customer/register?business=' . $business->qr_token;
        $businessId = Auth::user()->business->id;

        // Fetch the loyalty card details
        $loyaltyCard = \App\Models\LoyaltyCard::findOrFail($loyaltyCardId);

        // Generate 8 unique codes and save to database
        $tickets = [];
        $stampCodesToInsert = [];

        for ($i = 0; $i < 8; $i++) {
            do {
                $code = strtoupper(Str::random(8));
            } while (
                StampCode::where('code', $code)->exists() ||
                in_array($code, array_column($tickets, 'code'))
            );

            // Prepare data for database insertion
            $stampCodesToInsert[] = [
                'user_id' => Auth::id(),
                'business_id' => $businessId,
                'loyalty_card_id' => $loyaltyCardId,
                'code' => $code,
                'is_offline_code' => true,
                'created_at' => now(),
                'updated_at' => now()
            ];

            // Generate QR code and convert to base64
            $qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($registrationLink);
            $qrImageData = file_get_contents($qrImageUrl);
            $qrCodeBase64 = 'data:image/png;base64,' . base64_encode($qrImageData);

            $tickets[] = [
                'code' => $code,
                'qr_code_base64' => $qrCodeBase64
            ];
        }

        // Bulk insert all stamp codes into database
        StampCode::insert($stampCodesToInsert);

        $businessName = Auth::user()->business->name;

        $html = view('pdf.offline-stamps', [
            'tickets' => $tickets,
            'registrationLink' => $registrationLink,
            'businessName' => $businessName,
            'loyaltyCard' => $loyaltyCard
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('loyalty-stamps-' . date('Y-m-d') . '.pdf');
    }
}
