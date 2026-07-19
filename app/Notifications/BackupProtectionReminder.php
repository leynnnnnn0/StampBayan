<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BackupProtectionReminder extends Notification
{
    use Queueable;

    public function __construct(
        public ?int $daysRemaining,
        public string $businessName,
        public bool $expired = false,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        if ($this->expired) {
            return (new MailMessage)
                ->subject('Your StampBayan backups are paused')
                ->greeting('Backup protection is paused')
                ->line("The Data Protection plan for {$this->businessName} has expired.")
                ->line('Automatic restore points at 8:00 AM and 10:00 PM are paused until the plan is renewed.')
                ->action('Renew for ₱99', route('business.backups.index'))
                ->line('Your previously created restore points remain part of your retained backup history.');
        }

        $dayLabel = $this->daysRemaining === 1 ? '1 day' : "{$this->daysRemaining} days";

        return (new MailMessage)
            ->subject("StampBayan backup protection expires in {$dayLabel}")
            ->greeting('Keep your business protected')
            ->line("The Data Protection plan for {$this->businessName} expires in {$dayLabel}.")
            ->line('Renew before it expires to keep the 8:00 AM and 10:00 PM automatic backup schedule uninterrupted.')
            ->action('Renew for ₱99', route('business.backups.index'))
            ->line('Each payment provides another 30 days of backup protection.');
    }
}
