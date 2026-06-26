import ModuleHeading from "@/components/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, User, Calendar, CreditCard, CheckCircle2, Clock } from "lucide-react";

interface StampCode {
    id: number;
    code: string;
    number_of_stamps: number;
    used_at: string | null;
    loyalty_card: {
        name: string;
    };
}

interface Customer {
    id: number;
    username: string;
    email: string;
    created_at: string;
    stamp_codes: StampCode[];
}

interface Props {
    customer: Customer;
}

export default function Show({ customer }: Props) {
    return (
        <AppLayout>
            <Head title="Customer Details" />
            <ModuleHeading 
                title="Customer Details" 
                description="View comprehensive information about this customer and their loyalty activity"
            />

            <div className="space-y-6 mt-6">
                {/* Customer Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                        <CardDescription>Basic details and account information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                                    <p className="text-base font-semibold">{customer.username}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="text-base font-semibold">{customer.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                                    <p className="text-base font-semibold">
                                        {new Date(customer.created_at).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Stamps</p>
                                    <p className="text-base font-semibold">{customer.stamp_codes.reduce((total, stampCode) => total + stampCode.number_of_stamps, 0)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>


                {/* Stamp Codes List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Stamp Codes</CardTitle>
                        <CardDescription>Complete history of loyalty stamps</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {customer.stamp_codes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                <p className="text-muted-foreground">No stamp codes found for this customer</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {customer.stamp_codes.map((stampCode, index) => (
                                    <div key={stampCode.id}>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <p className="font-semibold">{stampCode.loyalty_card.name}</p>
                                                    {stampCode.used_at ? (
                                                        <Badge variant="default" className="gap-1">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Used
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Available
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground font-mono">
                                                    Code: {stampCode.code}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Number of Stamps: {stampCode.number_of_stamps}
                                                </p>
                                                {stampCode.used_at && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Used on {new Date(stampCode.used_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {index < customer.stamp_codes.length - 1 && <Separator />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
