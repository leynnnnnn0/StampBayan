import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import LOGO from '../../../../images/mainLogo.png';
interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/staff/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Staff Login" />
            
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center justify-center mb-2">
                             <a href="/">
                                 <img src={LOGO} alt="business logo" className='w-32 h-12'/>
                               </a>
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-center text-base">
                       
                                Sign in to your staff account
                         
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={submit}>
                        <CardContent className="space-y-4">
                            {status && (
                                <Alert>
                                    <AlertDescription>{status}</AlertDescription>
                                </Alert>
                            )}

                            {errors.username && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{errors.username}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="username" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    type="username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="john"
                                    required
                                    autoFocus
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="h-11"
                                />
                            </div>

                          
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4 mt-5">
                            <Button 
                                type="submit" 
                                className="w-full h-11 text-base bg-accent hover:bg-accent/70"
                                disabled={processing}
                            >
                                {processing ? 'Signing in...' : 'Sign In'}
                            </Button>

                        </CardFooter>
                    </form>
                </Card>
            </div>
        </>
    );
}
