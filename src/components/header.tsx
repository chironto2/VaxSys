
'use client';
import Link from 'next/link';
import {
  Syringe,
} from 'lucide-react';
import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from './ui/skeleton';

const HeaderActions = dynamic(() => import('./header-actions').then(mod => mod.HeaderActions), {
  ssr: false,
  loading: () => (
     <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-24" />
      </div>
  )
});

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Citizen Registration", href: "/citizen-registration" },
    { name: "Schedule Appointment", href: "/appointment/book" },
    { name: "Vaccine Card", href: "/vaccine-card" },
    { name: "Verify Card", href: "/verify-card" },
];


export function Header() {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Filter navLinks: if user is admin (authority), only show "Home"
  const filteredNavLinks = React.useMemo(() => {
    if (user?.role === 'authority') {
      return navLinks.filter(link => link.name === "Home");
    }
    return navLinks;
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center h-16">
        <div className="flex items-center mr-6">
          <Link href="/" className="flex items-center gap-2">
            <Syringe className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold font-headline">VaxSys</span>
          </Link>
        </div>
        <nav className="items-center hidden gap-6 text-sm font-medium md:flex">
          {filteredNavLinks.map(link => (
            <Link
              key={link.name}
              href={link.href}
              className="transition-colors text-foreground/60 hover:text-foreground/80"
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end flex-1 gap-2">
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}
