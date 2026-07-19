import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Clock3, ExternalLink, MessageCircle, ShieldCheck } from 'lucide-react';

type Props = {
    facebookUrl: string;
};

export default function Index({ facebookUrl }: Props) {
    return (
        <AppLayout>
            <Head title="Support" />

            <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center py-8">
                <Card className="w-full overflow-hidden border-amber-200 shadow-sm">
                    <div className="h-2 bg-amber-400" />
                    <CardContent className="px-6 py-12 text-center md:px-14 md:py-16">
                        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                            <MessageCircle className="size-8" />
                        </div>
                        <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-amber-700">Fast StampBayan support</p>
                        <h1 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
                            Tell us your issue directly on Facebook
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                            For technical issues, account concerns, restoration requests, or questions about StampBayan, message our Facebook page so we can understand the problem and help you faster.
                        </p>

                        <div className="mx-auto my-8 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
                            <div className="rounded-xl border bg-muted/20 p-4">
                                <Clock3 className="mb-3 size-5 text-amber-700" />
                                <p className="font-semibold">Faster conversation</p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">Reply in one familiar place without managing ticket threads.</p>
                            </div>
                            <div className="rounded-xl border bg-muted/20 p-4">
                                <CheckCircle2 className="mb-3 size-5 text-amber-700" />
                                <p className="font-semibold">Easy screenshots</p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">Send screenshots and explain exactly what happened.</p>
                            </div>
                            <div className="rounded-xl border bg-muted/20 p-4">
                                <ShieldCheck className="mb-3 size-5 text-amber-700" />
                                <p className="font-semibold">Direct assistance</p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">Reach the StampBayan team for account-specific guidance.</p>
                            </div>
                        </div>

                        <Button asChild size="lg" className="w-full bg-amber-400 text-black hover:bg-amber-500 sm:w-auto">
                            <a href={facebookUrl} target="_blank" rel="noreferrer">
                                <MessageCircle className="size-5" />
                                Contact StampBayan on Facebook
                                <ExternalLink className="size-4" />
                            </a>
                        </Button>
                        <p className="mt-4 text-xs text-muted-foreground">
                            Please include your business name and a clear description of the issue. Never send your password.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
