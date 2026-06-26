import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Lock,
    Mail,
    MessageCircleWarningIcon,
    User,
} from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';
import LOGO from '../../../../images/mainLogo.png';

interface Business {
    id: number;
    name: string;
    logo?: string;
}

interface RegisterProps {
    businesses: Business[];
    selectedBusiness?: Business;
}

export default function Register({
    selectedBusiness,
}: RegisterProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        business_id: selectedBusiness?.id?.toString() || '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/customer/register', {
            onSuccess: () => {
                toast.success(
                    'Registration successful! You can now start earning stamps.',
                );
                reset('password', 'password_confirmation');
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Customer Registration" />

            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="space-y-3">
                        <div className="mb-2 flex items-center justify-center">
                            {selectedBusiness?.logo ? (
                                <img
                                    src={selectedBusiness.logo}
                                    alt={selectedBusiness.name}
                                    className="h-16 w-auto"
                                />
                            ) : (
                                <img
                                    src={LOGO}
                                    alt="business logo"
                                    className="h-12 w-32"
                                />
                            )}
                        </div>
                        <CardTitle className="text-center text-2xl font-bold">
                            Create an Account
                        </CardTitle>
                        <CardDescription className="text-center text-base">
                            {selectedBusiness ? (
                                <span className="flex items-center justify-center gap-2">
                                    Registering for{' '}
                                    <span className="font-semibold text-foreground">
                                        {selectedBusiness.name}
                                    </span>
                                </span>
                            ) : (
                                'Sign up to get started'
                            )}
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={submit}>
                        <CardContent className="space-y-4">
                            {Object.keys(errors).length > 0 && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Please check the form for errors
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label
                                    htmlFor="username"
                                    className="flex items-center gap-2"
                                >
                                    <User className="h-4 w-4" />
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={data.username}
                                    onChange={(e) =>
                                        setData('username', e.target.value)
                                    }
                                    placeholder="johndoe"
                                    required
                                    autoFocus
                                    className="h-11"
                                />
                                {errors.username && (
                                    <p className="text-sm text-destructive">
                                        {errors.username}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="flex items-center gap-2"
                                >
                                    <Mail className="h-4 w-4" />
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    placeholder="customer@example.com"
                                    className="h-11"
                                />
                                <p className="flex items-center gap-1 text-xs text-orange-400">
                                    <MessageCircleWarningIcon className="size-4" />{' '}
                                    Used for password recovery
                                </p>
                                {errors.email && (
                                    <p className="text-sm text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="flex items-center gap-2"
                                >
                                    <Lock className="h-4 w-4" />
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    placeholder="••••••••"
                                    required
                                    className="h-11"
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="flex items-center gap-2"
                                >
                                    <Lock className="h-4 w-4" />
                                    Confirm Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="••••••••"
                                    required
                                    className="h-11"
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="mt-5 flex flex-col space-y-4">
                            <Button
                                type="submit"
                                className="h-11 w-full text-base"
                                disabled={processing}
                            >
                                {processing
                                    ? 'Creating account...'
                                    : 'Create Account'}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link
                                    href={'/customer/login'}
                                    className="font-semibold text-primary hover:text-accent/70 hover:underline"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </>
    );
}
