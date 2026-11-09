import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Construction, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface WheelFeedback {
    liked: boolean | number;
    remarks: string | null;
}

export default function PrizeWheelFeedback({
    feedback,
}: {
    feedback: WheelFeedback | null;
}) {
    const [open, setOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const form = useForm<{ liked: boolean | null; remarks: string }>({
        liked: feedback ? Boolean(feedback.liked) : null,
        remarks: feedback?.remarks ?? '',
    });
    return (
        <>
            <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
                <DialogContent className="max-h-[90dvh] overflow-y-auto">
                    <DialogTitle>
                        Give customers a reason to get their first loyalty card
                    </DialogTitle>
                    <DialogDescription>
                        A loyalty card gives customers a reason to return. Prize
                        Wheel is designed to give them a reason to join in the
                        first place.
                    </DialogDescription>
                    <p className="text-sm text-foreground">
                        The idea is simple: invite new customers to join your
                        loyalty program with a chance to win a welcome reward,
                        such as a free drink or a discount on their first
                        purchase.
                    </p>
                    <ol className="list-decimal space-y-3 pl-5 text-sm text-foreground">
                        <li>
                            Choose the prizes and set the chance of winning each
                            one.
                        </li>
                        <li>
                            Give new customers a reason to sign up: get their
                            first loyalty card and spin for a welcome reward.
                        </li>
                        <li>
                            Keep them coming back with your loyalty stamps and
                            rewards.
                        </li>
                    </ol>
                    <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                        Currently under development. You can configure prizes
                        and try test spins now. Customer signup, prize awarding,
                        and claiming are planned; test spins do not award real
                        prizes.
                    </p>
                    <Button type="button" onClick={() => setHelpOpen(false)}>
                        Got it
                    </Button>
                </DialogContent>
            </Dialog>
            <Dialog open={open} onOpenChange={setOpen}>
                <section className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted px-4 py-3 text-foreground">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Construction className="h-4 w-4 shrink-0" />
                        <span>Under development</span>
                        <button
                            type="button"
                            onClick={() => setHelpOpen(true)}
                            className="rounded-sm text-foreground underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4"
                        >
                            How it works?
                        </button>
                    </div>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            size="sm"
                            className="shrink-0 bg-foreground text-background hover:bg-foreground/90"
                        >
                            {feedback ? 'Edit vote' : 'Vote'}
                        </Button>
                    </DialogTrigger>
                </section>
                <DialogContent className="max-h-[90dvh] overflow-y-auto">
                    <DialogTitle>What do you think of Prize Wheel?</DialogTitle>
                    <DialogDescription>
                        Vote and share your ideas to help us improve this
                        feature.
                    </DialogDescription>
                    <form
                        className="mt-4 space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post('/business/prize-wheel/feedback', {
                                preserveScroll: true,
                                onSuccess: () => {
                                    toast.success(
                                        'Thank you for your feedback!',
                                    );
                                    setOpen(false);
                                },
                            });
                        }}
                    >
                        <fieldset>
                            <legend className="mb-2 text-sm font-semibold">
                                Do you like this feature?
                            </legend>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={
                                        form.data.liked === true
                                            ? 'default'
                                            : 'outline'
                                    }
                                    aria-pressed={form.data.liked === true}
                                    className={
                                        form.data.liked === true
                                            ? 'bg-foreground text-background hover:bg-foreground/90'
                                            : ''
                                    }
                                    onClick={() => form.setData('liked', true)}
                                >
                                    <ThumbsUp className="mr-2 h-4 w-4" />
                                    Like
                                </Button>
                                <Button
                                    type="button"
                                    variant={
                                        form.data.liked === false
                                            ? 'default'
                                            : 'outline'
                                    }
                                    aria-pressed={form.data.liked === false}
                                    className={
                                        form.data.liked === false
                                            ? 'bg-foreground text-background hover:bg-foreground/90'
                                            : ''
                                    }
                                    onClick={() => form.setData('liked', false)}
                                >
                                    <ThumbsDown className="mr-2 h-4 w-4" />
                                    Dislike
                                </Button>
                            </div>
                        </fieldset>
                        {form.errors.liked && (
                            <p className="text-sm text-destructive">
                                {form.errors.liked}
                            </p>
                        )}
                        <Label htmlFor="wheel-feedback-remarks">
                            Remarks (optional)
                        </Label>
                        <Textarea
                            id="wheel-feedback-remarks"
                            className="bg-background text-foreground"
                            placeholder="What do you like, or what could we improve?"
                            maxLength={2000}
                            value={form.data.remarks}
                            onChange={(event) =>
                                form.setData('remarks', event.target.value)
                            }
                        />
                        {form.errors.remarks && (
                            <p className="text-sm text-destructive">
                                {form.errors.remarks}
                            </p>
                        )}
                        <Button
                            type="submit"
                            className="bg-foreground text-background hover:bg-foreground/90"
                            disabled={
                                form.processing || form.data.liked === null
                            }
                        >
                            {form.processing
                                ? 'Saving…'
                                : feedback
                                  ? 'Update feedback'
                                  : 'Submit feedback'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
