
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Syringe, Archive, LineChart, UserPlus, Package } from 'lucide-react';
import { VaccineGuidelines } from '@/components/vaccine-guidelines';
import { getDashboardData, markDoseAdministered, confirmAppointment } from './actions';

type VaccineStock = {
  _id: string;
  vaccineName: string;
  totalStock: number;
  remainingStock: number;
  usedDoses: number;
  wastedDoses: number;
};

type CenterData = {
  _id: string;
  center_name: string;
  email: string;
  daily_capacity: number;
};

type AppointmentData = {
  _id: string;
  citizenName: string;
  appointmentDate: string;
  vaccineType: string;
  doseNumber: number;
  status: 'Pending' | 'Scheduled' | 'Administered';
};

type DashboardData = {
  center: CenterData;
  appointments: AppointmentData[];
  totalCitizens: number;
  stock: VaccineStock[];
};

export default function CenterDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [centerId, setCenterId] = React.useState<string | null>(null);

  const fetchDashboardData = React.useCallback(async (id: string) => {
    setIsLoading(true);
    const result = await getDashboardData(id);
    if (result.success && result.data) {
      setData(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed to load dashboard data',
        description: result.error || 'An unknown error occurred.',
      });
      router.push('/center/login');
    }
    setIsLoading(false);
  }, [toast, router]);

  React.useEffect(() => {
    const storedCenter = localStorage.getItem('center');
    if (storedCenter) {
      const parsedCenter = JSON.parse(storedCenter);
      if (parsedCenter?._id && parsedCenter?.role === 'center') {
        setCenterId(parsedCenter._id);
        fetchDashboardData(parsedCenter._id);
      } else {
        router.push('/center/login');
      }
    } else {
      router.push('/center/login');
    }
  }, [router, fetchDashboardData]);

  const handleConfirmAppointment = async (appointmentId: string) => {
    if (!centerId) return;
    const result = await confirmAppointment(appointmentId);
    if (result.success) {
      toast({ title: 'Appointment Confirmed!', description: 'The appointment has been scheduled.' });
      fetchDashboardData(centerId);
    } else {
      toast({ variant: 'destructive', title: 'Action Failed', description: result.error });
    }
  };
  
  const handleMarkAdministered = async (appointmentId: string, vaccineName: string) => {
     if (!centerId) return;
    const result = await markDoseAdministered(appointmentId, vaccineName);
    if (result.success) {
        toast({ title: 'Dose Administered!', description: 'The appointment and stock have been updated.' });
        if (centerId) fetchDashboardData(centerId);
    } else {
        toast({ variant: 'destructive', title: 'Action Failed', description: result.error });
    }
  };
  
  if (isLoading || !data) {
    return (
      <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 flex items-center justify-center">
              <p>Loading Dashboard...</p>
          </main>
          <Footer />
      </div>
    );
  }

  const { center, appointments, stock } = data;
  const totalRemaining = stock.reduce((sum, s) => sum + s.remainingStock, 0);
  const totalUsed = stock.reduce((sum, s) => sum + s.usedDoses, 0);
  const totalWasted = stock.reduce((sum, s) => sum + s.wastedDoses, 0);

  const getStatusBadge = (status: AppointmentData['status']) => {
    switch (status) {
      case 'Administered':
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case 'Scheduled':
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
      case 'Pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container space-y-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Welcome, {center.center_name}</h1>
                    <p className="text-muted-foreground">Your real-time vaccination status overview.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/center/stock">
                            <Package className="mr-2 h-4 w-4" />
                            Manage Stock
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/center/staff">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Manage Staff
                        </Link>
                    </Button>
                </div>
            </header>

             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Remaining Doses</CardTitle>
                        <Package className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRemaining}</div>
                        <p className="text-xs text-muted-foreground">Across all vaccine types</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Doses Used</CardTitle>
                        <Syringe className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsed}</div>
                        <p className="text-xs text-muted-foreground">Administered in total</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Wasted Doses</CardTitle>
                        <Archive className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalWasted}</div>
                        <p className="text-xs text-muted-foreground">Reported as wasted</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Daily Capacity</CardTitle>
                        <LineChart className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{center.daily_capacity}</div>
                        <p className="text-xs text-muted-foreground">Max appointments per day</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Appointments</CardTitle>
                            <CardDescription>View and manage today's scheduled appointments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Vaccine / Dose</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointments.map((appt) => (
                                        <TableRow key={appt._id}>
                                            <TableCell className="font-medium">{appt.citizenName}</TableCell>
                                            <TableCell>{appt.vaccineType} (Dose {appt.doseNumber})</TableCell>
                                            <TableCell>
                                                {getStatusBadge(appt.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {appt.status === 'Pending' && (
                                                    <Button size="sm" variant="outline" onClick={() => handleConfirmAppointment(appt._id)}>Confirm</Button>
                                                )}
                                                {appt.status === 'Scheduled' && (
                                                    <Button size="sm" onClick={() => handleMarkAdministered(appt._id, appt.vaccineType)}>Mark as Administered</Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {appointments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">No appointments scheduled for today.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-1 space-y-8">
                    <VaccineGuidelines />
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
