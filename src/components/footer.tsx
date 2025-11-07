import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Syringe, Twitter, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 border-t bg-card">
      <div className="container grid grid-cols-1 gap-8 text-center md:text-left md:grid-cols-4">
        <div className="flex flex-col items-center gap-4 md:items-start md:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <Syringe className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold font-headline">VaxSys</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Your Partner in Health and Immunization.
          </p>
          <div className="flex gap-4">
            <Link href="#" aria-label="Twitter">
              <Twitter className="w-5 h-5 transition-colors text-muted-foreground hover:text-primary" />
            </Link>
            <Link href="#" aria-label="Instagram">
              <Instagram className="w-5 h-5 transition-colors text-muted-foreground hover:text-primary" />
            </Link>
            <Link href="#" aria-label="Facebook">
              <Facebook className="w-5 h-5 transition-colors text-muted-foreground hover:text-primary" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 md:col-span-3">
          <div>
            <h3 className="mb-4 font-semibold">Navigation</h3>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-sm transition-colors text-muted-foreground hover:text-primary">Features</Link></li>
              <li><Link href="#learn-more" className="text-sm transition-colors text-muted-foreground hover:text-primary">How It Works</Link></li>
              <li><Link href="/login" className="text-sm transition-colors text-muted-foreground hover:text-primary">Log In</Link></li>
              <li><Link href="/signup" className="text-sm transition-colors text-muted-foreground hover:text-primary">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm transition-colors text-muted-foreground hover:text-primary">Vaccine Information</Link></li>
              <li><Link href="#" className="text-sm transition-colors text-muted-foreground hover:text-primary">Health Guidelines</Link></li>
              <li><Link href="#" className="text-sm transition-colors text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><Link href="#" className="text-sm transition-colors text-muted-foreground hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>
           <div>
            <h3 className="mb-4 font-semibold">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm transition-colors text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm transition-colors text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} VaxSys. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
