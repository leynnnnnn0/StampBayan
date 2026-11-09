import ModuleHeading from '@/components/module-heading';
import PrizeWheelFeedback, {
    type WheelFeedback,
} from '@/components/prize-wheel-feedback';
import WheelPreview from '@/components/prize-wheel-preview';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ImagePlus, Plus, Save, Sparkles, Trash2, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'sonner';

interface PrizeRecord {
    id: number;
    name: string;
    image_path: string | null;
    probability: string;
    color: string;
}

interface WheelRecord {
    title: string;
    description: string | null;
    is_active: boolean;
    prizes: PrizeRecord[];
}

interface PrizeForm {
    client_id: string;
    id: number | null;
    name: string;
    probability: number;
    color: string;
    image: File | null;
    image_path: string | null;
    image_preview: string | null;
    remove_image: boolean;
}

interface WheelForm {
    title: string;
    description: string;
    is_active: boolean;
    prizes: PrizeForm[];
}

const colors = [
    '#F8B83E',
    '#1F2937',
    '#F97316',
    '#14B8A6',
    '#8B5CF6',
    '#EC4899',
    '#3B82F6',
    '#22C55E',
];

let nextPrizeClientId = 1;

const createPrize = (index: number, probability = 0): PrizeForm => ({
    client_id: `new-prize-${nextPrizeClientId++}`,
    id: null,
    name: '',
    probability,
    color: colors[index % colors.length],
    image: null,
    image_path: null,
    image_preview: null,
    remove_image: false,
});

export default function Index({
    wheel,
    feedback,
}: {
    wheel: WheelRecord | null;
    feedback: WheelFeedback | null;
}) {
    const initialPrizes: PrizeForm[] = wheel?.prizes.length
        ? wheel.prizes.map((prize, index) => ({
              client_id: `saved-${prize.id}`,
              id: prize.id,
              name: prize.name,
              probability: Number(prize.probability),
              color: prize.color || colors[index % colors.length],
              image: null,
              image_path: prize.image_path,
              image_preview: null,
              remove_image: false,
          }))
        : [createPrize(0, 50), createPrize(1, 50)];

    const { data, setData, post, processing, errors } = useForm<WheelForm>({
        title: wheel?.title ?? 'Spin & Win',
        description:
            wheel?.description ??
            'Join our loyalty program and spin for a chance to win!',
        is_active: wheel?.is_active ?? false,
        prizes: initialPrizes,
    });

    const [expandedPrize, setExpandedPrize] = useState<string | null>(null);
    const totalProbability = data.prizes.reduce(
        (total, prize) => total + (Number(prize.probability) || 0),
        0,
    );
    const totalIsValid = Math.abs(totalProbability - 100) < 0.001;

    const updatePrize = (index: number, updates: Partial<PrizeForm>) => {
        setData(
            'prizes',
            data.prizes.map((prize, prizeIndex) =>
                prizeIndex === index ? { ...prize, ...updates } : prize,
            ),
        );
    };

    const handleImage = (
        index: number,
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 3 * 1024 * 1024) {
            toast.error('Prize images must be 3 MB or smaller.');
            return;
        }

        updatePrize(index, {
            image: file,
            image_preview: URL.createObjectURL(file),
            remove_image: false,
        });
    };

    const removeImage = (index: number) => {
        updatePrize(index, {
            image: null,
            image_path: null,
            image_preview: null,
            remove_image: true,
        });
    };

    const addPrize = () => {
        if (data.prizes.length >= 12) return;
        const prize = createPrize(data.prizes.length);
        setData('prizes', [...data.prizes, prize]);
        setExpandedPrize(prize.client_id);
    };

    const removePrize = (index: number) => {
        if (data.prizes.length <= 2) {
            toast.error('A prize wheel needs at least two prizes.');
            return;
        }
        setData(
            'prizes',
            data.prizes.filter((_, prizeIndex) => prizeIndex !== index),
        );
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!totalIsValid) {
            toast.error('Prize percentages must add up to exactly 100%.');
            return;
        }

        post('/business/prize-wheel', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Prize Wheel settings saved.'),
            onError: () => toast.error('Please check the highlighted fields.'),
        });
    };

    return (
        <AppLayout>
            <Head title="Prize Wheel" />
            <PrizeWheelFeedback feedback={feedback} />
            <ModuleHeading
                title="Prize Wheel"
                description="Create an exciting reason for new customers to join your loyalty program."
            />

            <form
                onSubmit={submit}
                className="mt-4 min-w-0 space-y-4 sm:mt-6 sm:space-y-6 [&_[data-slot=card-content]]:px-3 sm:[&_[data-slot=card-content]]:px-6 [&_[data-slot=card-header]]:px-3 sm:[&_[data-slot=card-header]]:px-6"
            >
                <div className="grid min-w-0 gap-4 sm:gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
                    <div className="min-w-0 space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Wheel details</CardTitle>
                                <CardDescription>
                                    Set the message customers will see with your
                                    wheel.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Wheel title</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(event) =>
                                            setData('title', event.target.value)
                                        }
                                        placeholder="Spin & Win"
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-destructive">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Invitation message
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(event) =>
                                            setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        rows={3}
                                        maxLength={240}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4">
                                    <div>
                                        <Label htmlFor="active">
                                            Activate wheel
                                        </Label>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Mark this configuration ready for
                                            your customer campaign.
                                        </p>
                                    </div>
                                    <Switch
                                        className="shrink-0"
                                        id="active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) =>
                                            setData('is_active', checked)
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex-col items-start justify-between gap-3 sm:flex-row">
                                <div>
                                    <CardTitle>Prizes and chances</CardTitle>
                                    <CardDescription className="mt-1.5">
                                        Add 2–12 prizes. All winning percentages
                                        must total 100%.
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addPrize}
                                    disabled={data.prizes.length >= 12}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add prize
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.prizes.map((prize, index) => {
                                    const image =
                                        prize.image_preview ??
                                        (prize.image_path
                                            ? `/${prize.image_path}`
                                            : null);
                                    const nameError = errors[
                                        `prizes.${index}.name` as keyof typeof errors
                                    ] as string | undefined;
                                    const probabilityError = errors[
                                        `prizes.${index}.probability` as keyof typeof errors
                                    ] as string | undefined;

                                    return (
                                        <div
                                            key={prize.client_id}
                                            className="@container min-w-0 rounded-xl border p-3 sm:p-4"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <button
                                                    type="button"
                                                    className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4"
                                                    aria-expanded={
                                                        expandedPrize ===
                                                        prize.client_id
                                                    }
                                                    aria-controls={`prize-editor-${prize.client_id}`}
                                                    onClick={() =>
                                                        setExpandedPrize(
                                                            expandedPrize ===
                                                                prize.client_id
                                                                ? null
                                                                : prize.client_id,
                                                        )
                                                    }
                                                >
                                                    {image && (
                                                        <img
                                                            src={image}
                                                            alt=""
                                                            className="h-9 w-9 shrink-0 rounded-md object-cover"
                                                        />
                                                    )}
                                                    <span
                                                        className="h-3 w-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                prize.color,
                                                        }}
                                                    />
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-sm font-semibold">
                                                            {prize.name ||
                                                                `Prize ${index + 1}`}
                                                        </span>
                                                        {(nameError ||
                                                            probabilityError) && (
                                                            <span className="text-xs text-destructive">
                                                                Needs attention
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                                                        {prize.probability}%
                                                    </span>
                                                    <span className="text-xs underline underline-offset-2">
                                                        {expandedPrize ===
                                                        prize.client_id
                                                            ? 'Close'
                                                            : 'Edit'}
                                                    </span>
                                                </button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        removePrize(index)
                                                    }
                                                    disabled={
                                                        data.prizes.length <= 2
                                                    }
                                                    aria-label={`Remove prize ${index + 1}`}
                                                >
                                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                            <div
                                                id={`prize-editor-${prize.client_id}`}
                                                className={`${expandedPrize === prize.client_id ? 'grid' : 'hidden'} mt-4 min-w-0 grid-cols-[minmax(0,1fr)_64px] gap-4 border-t pt-4 @min-[360px]:grid-cols-[96px_minmax(0,1fr)_64px]`}
                                            >
                                                <div className="col-span-2 space-y-2 @min-[360px]:col-span-1 @min-[360px]:row-span-2">
                                                    <Label>Image</Label>
                                                    <label className="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted/40 transition hover:border-primary">
                                                        {image ? (
                                                            <img
                                                                src={image}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImagePlus className="h-6 w-6 text-muted-foreground" />
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept="image/png,image/jpeg,image/webp"
                                                            className="sr-only"
                                                            onChange={(event) =>
                                                                handleImage(
                                                                    index,
                                                                    event,
                                                                )
                                                            }
                                                        />
                                                    </label>
                                                    {image && (
                                                        <button
                                                            type="button"
                                                            className="flex items-center text-xs text-muted-foreground hover:text-destructive"
                                                            onClick={() =>
                                                                removeImage(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <X className="mr-1 h-3 w-3" />
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="col-span-2 min-w-0 space-y-2">
                                                    <Label
                                                        htmlFor={`prize-name-${index}`}
                                                    >
                                                        Prize name
                                                    </Label>
                                                    <Input
                                                        id={`prize-name-${index}`}
                                                        value={prize.name}
                                                        onChange={(event) =>
                                                            updatePrize(index, {
                                                                name: event
                                                                    .target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="Free coffee"
                                                        maxLength={60}
                                                    />
                                                    {nameError && (
                                                        <p className="text-xs text-destructive">
                                                            {nameError}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor={`probability-${index}`}
                                                    >
                                                        Win chance
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            id={`probability-${index}`}
                                                            type="number"
                                                            min="0.01"
                                                            max="100"
                                                            step="0.01"
                                                            className="pr-8"
                                                            value={
                                                                prize.probability
                                                            }
                                                            onChange={(event) =>
                                                                updatePrize(
                                                                    index,
                                                                    {
                                                                        probability:
                                                                            Number(
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                    },
                                                                )
                                                            }
                                                        />
                                                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                                                            %
                                                        </span>
                                                    </div>
                                                    {probabilityError && (
                                                        <p className="text-xs text-destructive">
                                                            {probabilityError}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor={`color-${index}`}
                                                    >
                                                        Color
                                                    </Label>
                                                    <Input
                                                        id={`color-${index}`}
                                                        type="color"
                                                        value={prize.color}
                                                        className="h-10 cursor-pointer p-1"
                                                        onChange={(event) =>
                                                            updatePrize(index, {
                                                                color: event
                                                                    .target
                                                                    .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div
                                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-l-4 bg-background p-4 text-foreground ${
                                        totalIsValid
                                            ? 'border-border border-l-primary'
                                            : 'border-border border-l-destructive'
                                    }`}
                                >
                                    <div>
                                        <p className="font-medium">
                                            Total probability
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {totalIsValid
                                                ? 'Your wheel is balanced and ready to save.'
                                                : `${Math.abs(100 - totalProbability).toFixed(2)}% ${totalProbability < 100 ? 'still needs to be assigned.' : 'must be removed.'}`}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-2xl font-black ${totalIsValid ? 'text-foreground' : 'text-destructive'}`}
                                    >
                                        {totalProbability.toFixed(2)}%
                                    </span>
                                </div>
                                {errors.prizes && (
                                    <p className="text-sm text-destructive">
                                        {errors.prizes}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="min-w-0">
                        <Card className="2xl:sticky 2xl:top-6">
                            <CardHeader>
                                <div className="flex items-center gap-2 text-amber-500">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="text-xs font-bold tracking-widest uppercase">
                                        Live preview
                                    </span>
                                </div>
                                <CardTitle className="break-words">
                                    {data.title || 'Spin & Win'}
                                </CardTitle>
                                <CardDescription className="break-words">
                                    {data.description ||
                                        'Your invitation message will appear here.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mx-auto w-full max-w-[760px] rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 p-2 dark:from-slate-900 dark:via-slate-950 dark:to-amber-950/30">
                                    <WheelPreview prizes={data.prizes} />
                                </div>
                                <div className="mt-5 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                                    <span className="text-muted-foreground">
                                        Campaign status
                                    </span>
                                    <span
                                        className={`font-semibold ${data.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`}
                                    >
                                        {data.is_active ? 'Active' : 'Draft'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end border-t pt-5">
                    <Button
                        type="submit"
                        className="w-full sm:w-auto"
                        size="lg"
                        disabled={processing || !totalIsValid}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {processing ? 'Saving…' : 'Save Prize Wheel'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
