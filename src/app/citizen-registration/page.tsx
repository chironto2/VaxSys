
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import * as React from "react"
import { User, Calendar, ShieldCheck, Mail, RefreshCw } from "lucide-react"

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"
import { registerCitizen } from "./actions"

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => currentYear - i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const days = Array.from({ length: 31 }, (_, i) => i + 1)

const formSchema = z.object({
  fullName: z.string().nonempty("Full Name is required"),
  day: z.string().nonempty("Day is required"),
  month: z.string().nonempty("Month is required"),
  year: z.string().nonempty("Year is required"),
  idType: z.enum(["nid", "passport", "birth_certificate"], {
    required_error: "You need to select an identification type.",
  }),
  idNumber: z.string().nonempty("ID Number is required"),
  contact: z.string().nonempty("Email or Mobile No. is required"),
  captcha: z.string().nonempty("Captcha is required"),
}).refine(data => {
    if (data.idType === "nid") {
        return /^\d{17}$/.test(data.idNumber);
    }
    return true;
}, {
    message: "National ID must be 17 digits.",
    path: ["idNumber"],
}).refine(data => {
    if (data.idType === "passport") {
        return /^\d{9}$/.test(data.idNumber);
    }
    return true;
}, {
    message: "Passport No. must be 9 digits.",
    path: ["idNumber"],
});


function generateCaptcha() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}


export default function CitizenRegistrationPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [captcha, setCaptcha] = React.useState("");

  React.useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      day: "",
      month: "",
      year: "",
      idType: "nid",
      idNumber: "",
      contact: "",
      captcha: "",
    },
  })

  const idType = form.watch("idType");

  const getIdPlaceholder = () => {
    switch (idType) {
        case "nid":
            return "Enter 17-digit NID number";
        case "passport":
            return "Enter 9-digit Passport number";
        case "birth_certificate":
            return "Enter Birth Certificate number";
        default:
            return "Enter ID Number";
    }
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.captcha.toUpperCase() !== captcha) {
        form.setError("captcha", { type: "manual", message: "Captcha does not match." });
        return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await registerCitizen(values);

      if (result.success) {
        toast({
            title: "Registration Successful!",
            description: `Citizen with ${values.idType.replace('_', ' ')}: ${values.idNumber} has been registered.`,
        });
        form.reset();
        refreshCaptcha();
      } else {
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: result.error || "An unknown error occurred.",
        });
      }
    } catch (error) {
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
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">Citizen Vaccination Registration</CardTitle>
            <CardDescription>
              Please fill in the form below to register for vaccination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Enter your full name" {...field} disabled={isSubmitting} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Date of Birth */}
                <FormField
                  control={form.control}
                  name="day"
                  render={() => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
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
                
                {/* Identification Type */}
                <FormField
                  control={form.control}
                  name="idType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Identification Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                          disabled={isSubmitting}
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="nid" />
                            </FormControl>
                            <FormLabel className="font-normal">National ID Card</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="birth_certificate" />
                            </FormControl>
                            <FormLabel className="font-normal">Birth Certificate</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="passport" />
                            </FormControl>
                            <FormLabel className="font-normal">Passport</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* ID Number */}
                <FormField
                  control={form.control}
                  name="idNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identification Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="text" placeholder={getIdPlaceholder()} {...field} disabled={isSubmitting} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 {/* Contact Info */}
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email or Mobile No.</FormLabel>
                      <FormControl>
                         <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="text" placeholder="e.g., user@example.com or 01xxxxxxxxx" {...field} disabled={isSubmitting} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Captcha */}
                <div className="space-y-2">
                    <FormLabel>Verification</FormLabel>
                    <div className="flex items-center gap-4">
                         <div className="w-48 h-12 flex items-center justify-center rounded-md bg-muted select-none">
                            <span className="text-2xl font-bold tracking-[.25em] text-muted-foreground" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'10\' viewBox=\'0 0 100 10\'%3E%3Cpath d=\'M0 5 Q 25 0, 50 5 T 100 5\' stroke=\'%23dddddd\' fill=\'none\'/%3E%3C/svg%3E")', textDecoration: 'line-through' }}>
                                {captcha}
                            </span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={refreshCaptcha} disabled={isSubmitting}>
                            <RefreshCw className="w-5 h-5" />
                            <span className="sr-only">Refresh CAPTCHA</span>
                        </Button>
                    </div>
                </div>
                <FormField
                  control={form.control}
                  name="captcha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter the code above</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter verification code" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Registering..." : "Submit Registration"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
