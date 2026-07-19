<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPayMongoWebhook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayMongoWebhookController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $secret = config('services.paymongo.webhook_secret');
        $signature = $request->header('Paymongo-Signature');
        $rawBody = $request->getContent();

        if (! is_string($secret) || $secret === '' || ! is_string($signature)) {
            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        $expected = hash_hmac('sha256', $rawBody, $secret);

        if (! hash_equals($expected, $signature)) {
            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        $payload = json_decode($rawBody, true);

        if (! is_array($payload)) {
            return response()->json(['message' => 'Invalid payload.'], 400);
        }

        ProcessPayMongoWebhook::dispatchAfterResponse($payload);

        return response()->json(['received' => true]);
    }
}
