
'use client';
import Link from 'next/link';
import {
  Menu,
  ChevronDown,
  Shield,
  LayoutDashboard,
  UserPlus,
  Package,
  CalendarCheck,
} from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useUser } from '@/firebase/auth/use-user';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/firebase/client';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'citizen' | 'authority' | 'center';
}

interface Center {
    _id: string;
    center_name: string;
    email: string;
    role: 'center';
}

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Citizen Registration", href: "/citizen-registration" },
    { name: "Schedule Appointment", href: "/appointment/book" },
    { name: "Vaccine Card", href: "/vaccine-card" },
    { name: "Verify Card", href: "/verify-card" },
];

export function HeaderActions() {
  const { user: firebaseUser, isLoading } = useUser();
  const [user, setUser] = React.useState<User | null>(null);
  const [center, setCenter] = React.useState<Center | null>(null);


  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedCenter = localStorage.getItem('center');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
      }
    }

     if (storedCenter) {
      try {
        const parsedCenter = JSON.parse(storedCenter);
        setCenter(parsedCenter);
      } catch (error) {
        console.error("Failed to parse center from localStorage", error);
        localStorage.removeItem('center');
      }
    }
  }, []);

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    localStorage.removeItem('user');
    localStorage.removeItem('center');
    setUser(null);
    setCenter(null);
    window.location.href = '/';
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return `${name.charAt(0)}`.toUpperCase();
  };

  const isLoggedIn = !isLoading && (user || firebaseUser || center);
  const isCenterLoggedIn = !!center;

  return (
    <>
      <div className="items-center hidden gap-6 text-sm font-medium md:flex">
        {!isLoggedIn && (
         <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 transition-colors text-foreground/60 hover:text-foreground/80">
                      For Centers
                      <ChevronDown className="w-4 h-4" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                  <DropdownMenuItem asChild>
                     <Link href="/center/login">Center Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                      <Link href="/center/signup">Center Registration</Link>
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="flex items-center justify-end flex-1 gap-2">
         {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative w-8 h-8 rounded-full">
                <Avatar className="w-8 h-8">
                   {user && <AvatarFallback>{getInitials(`${user.firstName} ${user.lastName}`)}</AvatarFallback>}
                   {center && <AvatarFallback>{getInitials(center.center_name)}</AvatarFallback>}
                   {!user && !center && firebaseUser && <AvatarFallback>{getInitials(firebaseUser.displayName || firebaseUser.email || '')}</AvatarFallback>}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user ? `${user.firstName} ${user.lastName}`: center?.center_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || center?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user?.role === 'authority' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
              )}
               {center?.role === 'center' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/center/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Center Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/center/stock" className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Stock Management
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/center/staff" className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Staff Management
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              {user && user.role === 'citizen' && (
                <DropdownMenuItem asChild>
                    <Link href="/my-appointments" className="flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4" />
                        My Appointments
                    </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden md:flex gap-2">
             <Link href="/login">
                <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/signup">
                <Button>Sign Up</Button>
            </Link>
          </div>
        )}

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
               <SheetHeader className="pr-10 mt-6 text-left">
                  <SheetTitle asChild>
                     <Link href="/" className="flex items-center gap-2 mb-6">
                        <span className="text-lg font-bold font-headline">VaxSys</span>
                      </Link>
                  </SheetTitle>
                  <SheetDescription>
                    Navigate through the application sections.
                  </SheetDescription>
              </SheetHeader>
              <div className="pr-10 mt-6">
                <nav className="flex flex-col gap-4">
                  {/* Filter navLinks: if user is admin (authority), only show "Home" */}
                  {(user?.role === 'authority' 
                    ? navLinks.filter(link => link.name === "Home")
                    : navLinks
                  ).map(link => (
                     <SheetClose asChild key={link.name}>
                      <Link
                        href={link.href}
                        className="text-lg font-medium transition-colors text-foreground/80 hover:text-foreground"
                      >
                        {link.name}
                      </Link>
                    </SheetClose>
                  ))}
                  {!isLoggedIn && (
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="justify-start text-lg font-medium transition-colors text-foreground/80 hover:text-foreground">
                              For Centers
                              <ChevronDown className="w-4 h-4 ml-auto" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                          <DropdownMenuItem asChild>
                          <Link href="/center/login">Center Login</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                              <Link href="/center/signup">Center Registration</Link>
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
                  )}
                </nav>
                <Separator className="my-6" />
                <SheetFooter className="flex flex-col gap-4 sm:flex-col sm:space-x-0">
                  {isLoggedIn ? (
                    <>
                      {user?.role === 'authority' && (
                        <SheetClose asChild>
                           <Link href="/admin/dashboard">
                            <Button variant="outline" className="w-full justify-start gap-2">
                               <Shield className="w-4 h-4" /> Admin Dashboard
                            </Button>
                           </Link>
                        </SheetClose>
                      )}
                      {center?.role === 'center' && (
                        <>
                          <SheetClose asChild>
                            <Link href="/center/dashboard">
                              <Button variant="outline" className="w-full justify-start gap-2">
                                <LayoutDashboard className="w-4 h-4" /> Center Dashboard
                              </Button>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                           <Link href="/center/stock">
                             <Button variant="outline" className="w-full justify-start gap-2">
                               <Package className="w-4 h-4" /> Stock Management
                             </Button>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link href="/center/staff">
                              <Button variant="outline" className="w-full justify-start gap-2">
                                <UserPlus className="w-4 h-4" /> Staff Management
                              </Button>
                            </Link>
                          </SheetClose>
                        </>
                      )}
                      {user && user.role === 'citizen' && (
                      <SheetClose asChild>
                        <Link href="/my-appointments">
                          <Button variant="outline" className="w-full justify-start gap-2">
                            {user && <Avatar className="w-6 h-6">
                              <AvatarFallback>{getInitials(`${user.firstName} ${user.lastName}`)}</AvatarFallback>
                            </Avatar>}
                            My Appointments
                          </Button>
                        </Link>
                      </SheetClose>
                      )}
                      <SheetClose asChild>
                        <Button className="w-full" onClick={handleLogout}>Log Out</Button>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link href="/login">
                          <Button variant="outline" className="w-full">Log In</Button>
                        </Link>
                      </SheetClose>
                       <SheetClose asChild>
                        <Link href="/signup">
                          <Button className="w-full">Sign Up</Button>
                        </Link>
                      </SheetClose>
                    </>
                  )}
                 </SheetFooter>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
