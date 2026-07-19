<?php

namespace App\Console\Commands;

use App\Models\BackupSubscription;
use App\Notifications\BackupProtectionReminder;
use Illuminate\Console\Command;

class SendBackupProtectionReminders extends Command
{
    protected $signature = 'backups:send-expiration-reminders';

    protected $description = 'Send backup protection expiration and paused-backup reminders';

    public function handle(): int
    {
        BackupSubscription::query()
            ->with('business.user')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now()->addDays(7))
            ->chunkById(100, function ($subscriptions) {
                foreach ($subscriptions as $subscription) {
                    $owner = $subscription->business?->user;

                    if (! $owner) {
                        continue;
                    }

                    if ($subscription->expires_at->isPast()) {
                        if (! $subscription->expired_reminder_sent_at) {
                            $owner->notify(new BackupProtectionReminder(
                                daysRemaining: null,
                                businessName: $subscription->business->name,
                                expired: true,
                            ));
                            $subscription->update(['expired_reminder_sent_at' => now()]);
                        }

                        continue;
                    }

                    $daysRemaining = max(1, (int) now()->startOfDay()->diffInDays(
                        $subscription->expires_at->copy()->startOfDay(),
                        false,
                    ));

                    [$column, $reminderDays] = match (true) {
                        $daysRemaining <= 1 => ['one_day_reminder_sent_at', 1],
                        $daysRemaining <= 3 => ['three_day_reminder_sent_at', 3],
                        default => ['seven_day_reminder_sent_at', 7],
                    };

                    if (! $subscription->{$column}) {
                        $owner->notify(new BackupProtectionReminder(
                            daysRemaining: $reminderDays,
                            businessName: $subscription->business->name,
                        ));
                        $subscription->update([$column => now()]);
                    }
                }
            });

        return self::SUCCESS;
    }
}
