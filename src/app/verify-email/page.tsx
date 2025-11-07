
'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MailCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { resendVerificationEmail } from '../signup/actions';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const handleResend = async () => {
    if (!email) return;

    setIsSubmitting(true);
    try {
      const result = await resendVerificationEmail(email);
      if (result.success) {
        toast({
          title: 'Verification Email Sent',
          description: 'A new verification link has been sent to your email address.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Resend',
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-lg text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <MailCheck className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold font-headline">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn't receive an email? Check your spam folder or click below to resend.
            </p>
            <Button onClick={handleResend} disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
