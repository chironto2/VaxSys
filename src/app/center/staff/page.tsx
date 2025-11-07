
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { addStaff, getStaff, updateStaff, deleteStaff } from './actions';
import { User, UserPlus, Edit, Trash2 } from 'lucide-react';

const staffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['Nurse', 'Administrator', 'Support Staff']),
  contact: z.string().min(10, 'A valid contact number is required'),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffData extends StaffFormValues {
    _id: string;
}

export default function StaffManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [centerId, setCenterId] = React.useState<string | null>(null);
  const [staffList, setStaffList] = React.useState<StaffData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState<StaffData | null>(null);

  const { control, handleSubmit, register, reset, formState: { errors } } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: '', role: 'Nurse', contact: '' },
  });

  const { control: editControl, handleSubmit: handleEditSubmit, register: editRegister, reset: resetEdit, formState: { errors: editErrors } } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
  });

  const fetchStaff = React.useCallback(async (id: string) => {
    setIsLoading(true);
    const result = await getStaff(id);
    if(result.success && result.staff) {
        setStaffList(result.staff);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch staff list.'});
    }
    setIsLoading(false);
  }, [toast]);

  React.useEffect(() => {
    const storedCenter = localStorage.getItem('center');
    if (storedCenter) {
        const parsedCenter = JSON.parse(storedCenter);
        if (parsedCenter?._id) {
            setCenterId(parsedCenter._id);
            fetchStaff(parsedCenter._id);
        } else {
            router.push('/center/login');
        }
    } else {
        router.push('/center/login');
    }
  }, [router, fetchStaff]);

  const onAddSubmit = async (data: StaffFormValues) => {
    if(!centerId) return;
    setIsSubmitting(true);
    const result = await addStaff({ ...data, centerId });
    if (result.success) {
        toast({ title: 'Success', description: 'New staff member added.' });
        reset({ name: '', role: 'Nurse', contact: '' });
        fetchStaff(centerId);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmitting(false);
  };
  
  const onEditSubmit = async (data: StaffFormValues) => {
    if(!centerId || !selectedStaff) return;
    setIsSubmitting(true);
    const result = await updateStaff({ ...data, centerId, id: selectedStaff._id });
    if(result.success) {
      toast({ title: 'Success!', description: 'Staff member details have been updated.' });
      fetchStaff(centerId);
      setIsEditDialogOpen(false);
      setSelectedStaff(null);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmitting(false);
  };
  
  const handleDelete = async (staffId: string) => {
    const result = await deleteStaff(staffId);
    if(result.success) {
      toast({ title: 'Staff Deleted', description: 'The staff member has been removed from the system.' });
      setStaffList(staffList.filter(s => s._id !== staffId));
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };

  const openEditDialog = (staff: StaffData) => {
    setSelectedStaff(staff);
    resetEdit(staff);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading staff data...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container space-y-8">
            <header>
                <h1 className="text-3xl font-bold font-headline">Staff Management</h1>
                <p className="text-muted-foreground">Add, view, and manage your center's staff members.</p>
            </header>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Staff</CardTitle>
                            <CardDescription>Fill out the form to add a new person to your team.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                                    <Input id="name" {...register('name')} placeholder="e.g., Jane Doe" disabled={isSubmitting}/>
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                                </div>
                                 <div>
                                    <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
                                    <Controller
                                        name="role"
                                        control={control}
                                        render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                            <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Nurse">Nurse</SelectItem>
                                                <SelectItem value="Administrator">Administrator</SelectItem>
                                                <SelectItem value="Support Staff">Support Staff</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        )}
                                    />
                                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
                                </div>
                                 <div>
                                    <label htmlFor="contact" className="block text-sm font-medium mb-1">Contact Number</label>
                                    <Input id="contact" {...register('contact')} placeholder="e.g., 01xxxxxxxxx" disabled={isSubmitting}/>
                                    {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact.message}</p>}
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? 'Adding...' : 'Add Staff Member'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>Current Staff</CardTitle>
                            <CardDescription>A list of all staff members at your center.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staffList.map((staff) => (
                                        <TableRow key={staff._id}>
                                            <TableCell className="font-medium">{staff.name}</TableCell>
                                            <TableCell>{staff.role}</TableCell>
                                            <TableCell>{staff.contact}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(staff)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                  <AlertDialogTrigger asChild>
                                                     <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                     </Button>
                                                  </AlertDialogTrigger>
                                                  <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                      <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete {staff.name} from your staff list.
                                                      </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                      <AlertDialogAction onClick={() => handleDelete(staff._id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                  </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                     {staffList.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">No staff members found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Staff Member</DialogTitle>
                <DialogDescription>Update the details for {selectedStaff?.name}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium mb-1">Full Name</label>
                    <Input id="edit-name" {...editRegister('name')} disabled={isSubmitting}/>
                    {editErrors.name && <p className="text-red-500 text-xs mt-1">{editErrors.name.message}</p>}
                </div>
                <div>
                    <label htmlFor="edit-role" className="block text-sm font-medium mb-1">Role</label>
                    <Controller
                        name="role"
                        control={editControl}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                            <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Nurse">Nurse</SelectItem>
                                <SelectItem value="Administrator">Administrator</SelectItem>
                                <SelectItem value="Support Staff">Support Staff</SelectItem>
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {editErrors.role && <p className="text-red-500 text-xs mt-1">{editErrors.role.message}</p>}
                </div>
                <div>
                    <label htmlFor="edit-contact" className="block text-sm font-medium mb-1">Contact Number</label>
                    <Input id="edit-contact" {...editRegister('contact')} disabled={isSubmitting}/>
                    {editErrors.contact && <p className="text-red-500 text-xs mt-1">{editErrors.contact.message}</p>}
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
