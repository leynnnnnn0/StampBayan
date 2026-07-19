<?php

use App\Models\BackupPayment;
use App\Models\BackupSubscription;
use App\Models\Business;
use App\Models\CompletedLoyaltyCard;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\Perk;
use App\Models\PerkClaim;
use App\Models\QrCode;
use App\Models\Staff;
use App\Models\StampCode;
use App\Models\Suggestion;
use App\Models\Ticket;
use App\Models\TicketReply;
use App\Models\User;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('every application model uses soft deletes and has a deleted at column', function () {
    $models = [
        BackupPayment::class,
        BackupSubscription::class,
        Business::class,
        CompletedLoyaltyCard::class,
        Customer::class,
        LoyaltyCard::class,
        Perk::class,
        PerkClaim::class,
        QrCode::class,
        Staff::class,
        StampCode::class,
        Suggestion::class,
        Ticket::class,
        TicketReply::class,
        User::class,
    ];

    foreach ($models as $modelClass) {
        $model = new $modelClass;

        expect(class_uses_recursive($modelClass))
            ->toContain(SoftDeletes::class)
            ->and(Schema::hasColumn($model->getTable(), $model->getDeletedAtColumn()))
            ->toBeTrue();
    }
});

test('deleting a user preserves the row and excludes it from normal queries', function () {
    $user = User::factory()->create();

    $user->delete();

    expect(User::find($user->id))->toBeNull()
        ->and(User::withTrashed()->find($user->id))->not->toBeNull()
        ->and(User::withTrashed()->find($user->id)?->deleted_at)->not->toBeNull();
});
