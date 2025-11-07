
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Users, Hospital, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUsers, getCenters, updateUserRole, verifyCenter, rejectCenter } from './actions';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
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
} from "@/components/ui/alert-dialog"

export const dynamic = 'force-dynamic';

type UserData = {
  _id: string;
  firebaseUid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'citizen' | 'authority' | 'center';
};

type CenterData = {
    _id: string;
    center_name: string;
    email: string;
    location: {
        district: string;
        address: string;
    };
    verified: boolean;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user: firebaseUser, isLoading: isAuthLoading } = useUser();
  const [localUser, setLocalUser] = React.useState<any>(null);
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [centers, setCenters] = React.useState<CenterData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    const [usersResult, centersResult] = await Promise.all([getUsers(), getCenters()]);
    
    if (usersResult.success && usersResult.users) {
      setUsers(usersResult.users);
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed to load users',
        description: usersResult.error || 'An unknown error occurred.',
      });
    }

    if (centersResult.success && centersResult.centers) {
      setCenters(centersResult.centers);
    } else {
       toast({
        variant: 'destructive',
        title: 'Failed to load centers',
        description: centersResult.error || 'An unknown error occurred.',
      });
    }

    setIsLoading(false);
  }, [toast]);


  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setLocalUser(parsedUser);
      if (parsedUser?.role !== 'authority') {
        router.push('/');
      }
    } else if (!isAuthLoading && !firebaseUser) {
       router.push('/login');
    }
  }, [isAuthLoading, firebaseUser, router]);

  React.useEffect(() => {
    if (localUser?.role === 'authority') {
      fetchData();
    }
  }, [localUser, fetchData]);

  const handleRoleChange = async (userId: string, newRole: 'citizen' | 'authority' | 'center') => {
    if (!firebaseUser) return;
    
    const currentUserFirebaseUid = firebaseUser.uid;
    const result = await updateUserRole({ targetUserId: userId, newRole, adminFirebaseUid: currentUserFirebaseUid });

    if (result.success) {
      toast({
        title: 'Success',
        description: 'User role updated successfully.',
      });
      router.refresh();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error updating role',
        description: result.error,
      });
    }
  };

  const handleApproveCenter = async (centerId: string) => {
    if (!firebaseUser) return;

    const result = await verifyCenter({ centerId, adminFirebaseUid: firebaseUser.uid });
    if (result.success) {
        toast({
            title: 'Center Approved!',
            description: 'The center is now active and can log in.',
        });
        router.refresh(); 
    } else {
        toast({
            variant: 'destructive',
            title: 'Approval Failed',
            description: result.error,
        });
    }
  };

  const handleRejectCenter = async (centerId: string) => {
    if (!firebaseUser) return;

    const result = await rejectCenter({ centerId, adminFirebaseUid: firebaseUser.uid });
    if (result.success) {
        toast({
            title: 'Center Rejected',
            description: 'The center registration has been removed.',
        });
        router.refresh();
    } else {
        toast({
            variant: 'destructive',
            title: 'Rejection Failed',
            description: result.error,
        });
    }
  };
  
  if (isAuthLoading || isLoading || localUser?.role !== 'authority') {
    return (
      <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 flex items-center justify-center">
              <p>Loading & Verifying Access...</p>
          </main>
          <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
        <Header />
        <main className="flex-1 py-12 px-4 md:px-6">
            <div className="container space-y-8">
                <header>
                    <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage users, centers, and system settings.</p>
                </header>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.length}</div>
                            <p className="text-xs text-muted-foreground">All registered users in the system</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Centers</CardTitle>
                            <Hospital className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{centers.length}</div>
                            <p className="text-xs text-muted-foreground">All registered vaccination centers</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                            <CheckCircle className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{centers.filter(c => !c.verified).length}</div>
                            <p className="text-xs text-muted-foreground">Centers awaiting approval</p>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid gap-8 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Center Management</CardTitle>
                            <CardDescription>Approve or reject new vaccination center registrations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Center Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {centers.map((center) => (
                                        <TableRow key={center._id}>
                                            <TableCell className="font-medium">{center.center_name}</TableCell>
                                            <TableCell>
                                                <Badge variant={center.verified ? 'default' : 'secondary'} className={center.verified ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                                                    {center.verified ? 'Approved' : 'Pending'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!center.verified ? (
                                                  <div className="flex justify-end gap-2">
                                                    <Button size="sm" onClick={() => handleApproveCenter(center._id)}>Approve</Button>
                                                    <AlertDialog>
                                                      <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="destructive">Reject</Button>
                                                      </AlertDialogTrigger>
                                                      <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                          <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the registration for "{center.center_name}".
                                                          </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                          <AlertDialogAction onClick={() => handleRejectCenter(center._id)}>
                                                            Yes, reject
                                                          </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                      </AlertDialogContent>
                                                    </AlertDialog>
                                                  </div>
                                                ) : (
                                                  <span className="text-sm text-muted-foreground">No actions</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>Manage user roles in the system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                                        <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'citizen')}>
                                                    Make Citizen
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'authority')}>
                                                    Make Authority
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user._id, 'center')}>
                                                    Make Center
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
        <Footer />
    </div>
  );
}
