import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Syringe, ShieldCheck, CalendarDays, Info } from 'lucide-react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 text-center md:py-32 lg:py-40 bg-primary/10">
           <div className="container z-10 relative">
              <h1 className="text-4xl font-extrabold tracking-tighter text-primary sm:text-5xl md:text-6xl lg:text-7xl font-headline">
                Stay Protected. Stay Healthy.
              </h1>
              <p className="max-w-3xl mx-auto mt-6 text-lg text-foreground md:text-xl">
                Easily schedule, track, and manage your vaccinations. Your health, simplified and secured.
              </p>
              <div className="mt-8 space-x-4">
                <Button asChild size="lg">
                  <Link href="/signup">Schedule Your Vaccination</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="#learn-more">Learn More</Link>
                </Button>
              </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tight text-center md:text-4xl font-headline">Why Choose VaxSys?</h2>
            <p className="max-w-2xl mx-auto mt-4 text-center text-muted-foreground">
                We provide a seamless and secure platform for all your vaccination needs.
            </p>
            <div className="grid gap-8 mt-12 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <CalendarDays className="w-12 h-12 text-primary" />
                  </div>
                  <CardTitle>Easy Scheduling</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Book your vaccination appointments online in just a few clicks.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                   <div className="flex justify-center mb-4">
                    <ShieldCheck className="w-12 h-12 text-primary" />
                  </div>
                  <CardTitle>Secure Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Keep track of your immunization history in a secure, digital format.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                   <div className="flex justify-center mb-4">
                    <Info className="w-12 h-12 text-primary" />
                  </div>
                  <CardTitle>Reliable Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Access up-to-date information about vaccines and health guidelines.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                   <div className="flex justify-center mb-4">
                    <Syringe className="w-12 h-12 text-primary" />
                  </div>
                  <CardTitle>For All Ages</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Manage vaccination schedules for your entire family, from children to seniors.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="learn-more" className="py-16 md:py-24 bg-secondary">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tight text-center md:text-4xl font-headline">Get Vaccinated in 3 Simple Steps</h2>
            <div className="grid items-center gap-12 mt-12 md:grid-cols-2">
               <div className="order-2 md:order-1">
                    <div className="flex items-start gap-6 mb-8">
                        <div className="flex items-center justify-center w-12 h-12 text-2xl font-bold rounded-full bg-primary text-primary-foreground">1</div>
                        <div>
                            <h3 className="text-xl font-semibold">Create Your Account</h3>
                            <p className="mt-2 text-muted-foreground">Sign up for a free, secure account to get started.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-6 mb-8">
                        <div className="flex items-center justify-center w-12 h-12 text-2xl font-bold rounded-full bg-primary text-primary-foreground">2</div>
                        <div>
                            <h3 className="text-xl font-semibold">Book an Appointment</h3>
                            <p className="mt-2 text-muted-foreground">Find a convenient location and time slot that works for you.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-6">
                        <div className="flex items-center justify-center w-12 h-12 text-2xl font-bold rounded-full bg-primary text-primary-foreground">3</div>
                        <div>
                            <h3 className="text-xl font-semibold">Get Vaccinated</h3>
                            <p className="mt-2 text-muted-foreground">Visit the clinic for your appointment and receive your vaccination.</p>
                        </div>
                    </div>
               </div>
               <div className="order-1 md:order-2">
                    <Carousel className="w-full max-w-xl mx-auto" opts={{ loop: true }}>
                      <CarouselContent>
                        <CarouselItem>
                          <Image 
                              src="https://picsum.photos/seed/vaccine-shot/600/500" 
                              alt="A child getting vaccinated by a doctor"
                              width={600}
                              height={500}
                              className="w-full rounded-lg shadow-lg"
                              data-ai-hint="child vaccination"
                          />
                        </CarouselItem>
                         <CarouselItem>
                          <Image 
                              src="https://picsum.photos/seed/doctor-child/600/500" 
                              alt="A doctor prepares a vaccine for a child"
                              width={600}
                              height={500}
                              className="w-full rounded-lg shadow-lg"
                              data-ai-hint="child doctor"
                          />
                        </CarouselItem>
                         <CarouselItem>
                          <Image 
                              src="https://picsum.photos/seed/brave-kid/600/500" 
                              alt="A brave child getting a shot"
                              width={600}
                              height={500}
                              className="w-full rounded-lg shadow-lg"
                              data-ai-hint="brave child"
                          />
                        </CarouselItem>
                      </CarouselContent>
                      <CarouselPrevious className="hidden sm:flex" />
                      <CarouselNext className="hidden sm:flex" />
                    </Carousel>
               </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
