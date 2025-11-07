
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import * as React from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"
import { searchCitizen } from "./actions"

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => currentYear - i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const days = Array.from({ length: 31 }, (_, i) => i + 1)

const formSchema = z.object({
  idNumber: z.string().nonempty("ID Number is required"),
  day: z.string().nonempty("Day is required"),
  month: z.string().nonempty("Month is required"),
  year: z.string().nonempty("Year is required"),
});

export default function VaccineCardPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [citizenData, setCitizenData] = React.useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idNumber: "",
      day: "",
      month: "",
      year: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await searchCitizen(values);
      if (result.success && result.data) {
        setCitizenData(result.data);
        toast({
          title: "Citizen Found!",
          description: "Vaccine card is ready for download.",
        });
      } else {
        setCitizenData(null);
        toast({
          variant: "destructive",
          title: "Search Failed",
          description: result.error || "Could not find a citizen with the provided details.",
        });
      }
    } catch (error) {
      setCitizenData(null);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-primary/5">
        <div className="w-full max-w-4xl space-y-8">
            <Card className="shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold font-headline">Epi Card Download</CardTitle>
                <CardDescription>
                Enter your details to find and download your vaccine card.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Birth Registration Certificate Number / Mobile Number / Member ID *</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter your identification number" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="day"
                    render={() => (
                        <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="day"
                                render={({ field }) => (
                                    <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                        <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="month"
                                render={({ field }) => (
                                    <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                        <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {months.map(m => <SelectItem key={m} value={String(m)}>{m}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                        <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        </FormItem>
                    )}
                    />
                    
                    <Button type="submit" className="w-full md:w-auto" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Searching..." : "Search"}
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>

            {citizenData && (
                <div id="printable-card-area">
                    <Card className="shadow-lg printable-card">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold font-headline">Digital Vaccine Card</CardTitle>
                            <CardDescription>
                                This card is official proof of your vaccination status.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-3 gap-6 items-center">
                            <div className="md:col-span-1 flex justify-center">
                                <Image 
                                    src={citizenData.qrCodeUrl}
                                    alt="QR Code"
                                    width={200}
                                    height={200}
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p className="text-lg font-semibold">{citizenData.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                                    <p className="text-lg font-semibold">{new Date(citizenData.dateOfBirth).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Identification</p>
                                    <p className="text-lg font-semibold">{citizenData.idType.toUpperCase()}: {citizenData.idNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Vaccination Status</p>
                                    <p className="text-lg font-semibold text-green-600">{citizenData.status}</p>
                                </div>
                                <Button className="w-full" onClick={() => window.print()}>Download Card</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
