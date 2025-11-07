
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2, Hospital, Stethoscope, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { getCenters, bookAppointment, getCitizenByIdNumber, getAvailableVaccines } from './actions';

const formSchema = z.object({
    idNumber: z.string().nonempty('ID number is required to verify your registration.'),
    centerId: z.string().nonempty('Please select a vaccination center.'),
    vaccineType: z.string().nonempty('Please select a vaccine.'),
    appointmentDate: z.date({ required_error: 'Please select a date.' }),
    doseNumber: z.coerce.number().min(1, 'Dose number is required.'),
});

type FormData = z.infer<typeof formSchema>;

export default function BookAppointmentPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user: firebaseUser, isLoading: isAuthLoading } = useUser();
    const [centers, setCenters] = React.useState<any[]>([]);
    const [vaccines, setVaccines] = React.useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            idNumber: '',
            centerId: '',
            vaccineType: '',
            doseNumber: undefined,
        },
    });

    const selectedCenterId = form.watch('centerId');

    React.useEffect(() => {
        const fetchInitialData = async () => {
            const centersResult = await getCenters();
            if (centersResult.success) {
                setCenters(centersResult.centers || []);
            }
        };
        fetchInitialData();
    }, []);

     React.useEffect(() => {
        if (!selectedCenterId) {
            setVaccines([]);
            return;
        }

        const fetchVaccines = async () => {
            const vaccinesResult = await getAvailableVaccines(selectedCenterId);
            if (vaccinesResult.success) {
                setVaccines(vaccinesResult.vaccines || []);
                form.setValue('vaccineType', '');
            }
        };
        fetchVaccines();
    }, [selectedCenterId, form]);

    React.useEffect(() => {
        if (!isAuthLoading && !firebaseUser && !localStorage.getItem('user')) {
            toast({ title: "Authentication Required", description: "You must be logged in to book an appointment.", variant: 'destructive' });
            router.push('/login');
        }
    }, [firebaseUser, isAuthLoading, router, toast]);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        
        const citizenResult = await getCitizenByIdNumber(data.idNumber);
        if(!citizenResult.success || !citizenResult.citizen) {
            toast({ variant: 'destructive', title: 'Citizen Not Found', description: 'No registered citizen found with that ID number. Please register first.' });
            setIsSubmitting(false);
            return;
        }
        
        const appointmentData = {
            ...data,
            citizenId: citizenResult.citizen._id,
            appointmentDate: data.appointmentDate.toISOString(),
        };

        const result = await bookAppointment(appointmentData);

        if (result.success) {
            toast({ title: 'Appointment Booked!', description: 'Your vaccination appointment has been scheduled successfully.' });
            router.push('/');
        } else {
            toast({ variant: 'destructive', title: 'Booking Failed', description: result.error || 'An unknown error occurred.' });
        }
        setIsSubmitting(false);
    };

    if (isAuthLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
            <Header />
            <main className="flex-1 py-12 px-4 md:px-6">
                <div className="container max-w-2xl mx-auto">
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl font-bold font-headline">Schedule Your Vaccination</CardTitle>
                            <CardDescription>Follow the steps below to book your appointment.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                
                                <Controller
                                    control={form.control}
                                    name="idNumber"
                                    render={({ field, fieldState }) => (
                                        <div className="space-y-2">
                                            <Label htmlFor="idNumber">Your Citizen ID Number</Label>
                                            <Input id="idNumber" placeholder="Enter the ID number you registered with" {...field} />
                                            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="centerId"
                                    render={({ field, fieldState }) => (
                                        <div className="space-y-2">
                                            <Label>Select Center</Label>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a vaccination center" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {centers.map(center => (
                                                        <SelectItem key={center._id} value={center._id}>
                                                            {center.center_name} - {center.location.district}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                                        </div>
                                    )}
                                />
                                
                                <Controller
                                    control={form.control}
                                    name="vaccineType"
                                    render={({ field, fieldState }) => (
                                        <div className="space-y-2">
                                            <Label>Select Vaccine</Label>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCenterId || vaccines.length === 0}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={!selectedCenterId ? "Select a center first" : "Choose available vaccine"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vaccines.map(vaccine => (
                                                        <SelectItem key={vaccine} value={vaccine}>
                                                            {vaccine}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                                        </div>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Controller
                                        control={form.control}
                                        name="appointmentDate"
                                        render={({ field, fieldState }) => (
                                            <div className="space-y-2">
                                                <Label>Select Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        control={form.control}
                                        name="doseNumber"
                                        render={({ field, fieldState }) => (
                                            <div className="space-y-2">
                                                <Label htmlFor="doseNumber">Dose Number</Label>
                                                <Input id="doseNumber" type="number" min="1" placeholder="e.g., 1 for first dose" {...field} value={field.value === undefined ? '' : field.value} />
                                                {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                                            </div>
                                        )}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...</> : 'Book Appointment'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
