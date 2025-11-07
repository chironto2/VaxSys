'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, RefreshCw, Loader2, PartyPopper } from 'lucide-react';
import { extractVaccineCardData, type VaccineCardData } from '@/ai/flows/extract-vaccine-card-data-flow';

export default function VerifyCardPage() {
  const { toast } = useToast();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [extractedData, setExtractedData] = React.useState<VaccineCardData | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = React.useState(false);


  const getCameraPermission = React.useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access.',
      });
      setHasCameraPermission(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      setIsCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  }, [toast]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  }

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUri);
        processImage(dataUri);
        stopCamera();
      }
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setImagePreview(dataUri);
        processImage(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (dataUri: string) => {
    setIsProcessing(true);
    setExtractedData(null);
    try {
      const result = await extractVaccineCardData({ photoDataUri: dataUri });
      setExtractedData(result);
      toast({
        title: 'Extraction Successful!',
        description: 'Data has been extracted from the vaccine card.',
      });
    } catch (error) {
      console.error('Error extracting data:', error);
      toast({
        variant: 'destructive',
        title: 'Extraction Failed',
        description: 'Could not extract data from the image. Please try a clearer image.',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetState = () => {
    setExtractedData(null);
    setImagePreview(null);
    stopCamera();
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container max-w-4xl mx-auto space-y-8">
          <header className="text-center">
            <h1 className="text-3xl font-bold font-headline">Vaccine Card OCR</h1>
            <p className="text-muted-foreground">
              Use your camera or upload an image to automatically extract data from a paper vaccine card.
            </p>
          </header>

          {!imagePreview && (
            <Card>
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-center gap-6">
                 <Button onClick={getCameraPermission} size="lg" className="w-full md:w-auto">
                    <Camera className="mr-2 h-5 w-5" />
                    Use Camera
                </Button>
                 <span className="text-muted-foreground">or</span>
                 <Button onClick={() => fileInputRef.current?.click()} size="lg" variant="outline" className="w-full md:w-auto">
                     <Upload className="mr-2 h-5 w-5" />
                    Upload Image
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
              </CardContent>
            </Card>
          )}
          
          {hasCameraPermission === false && (
            <Alert variant="destructive">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Camera access is disabled. Please enable it in your browser settings to use this feature.
              </AlertDescription>
            </Alert>
          )}

          {isCameraOn && !imagePreview && (
            <Card>
              <CardContent className="p-6">
                <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay playsInline muted />
                <div className="mt-4 flex justify-center gap-4">
                  <Button onClick={handleCapture} size="lg">Capture Photo</Button>
                  <Button onClick={stopCamera} size="lg" variant="outline">Close Camera</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <canvas ref={canvasRef} className="hidden"></canvas>

          {isProcessing && (
             <Card>
                <CardContent className="p-10 flex flex-col items-center justify-center gap-4 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="font-semibold text-lg">Extracting Data...</p>
                    <p className="text-muted-foreground">The AI is analyzing the image. This may take a moment.</p>
                </CardContent>
            </Card>
          )}

          {extractedData && (
             <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <PartyPopper className="w-6 h-6 text-green-600"/>
                                Extracted Information
                            </CardTitle>
                            <CardDescription>Review the data extracted from the vaccine card.</CardDescription>
                        </div>
                        <Button variant="outline" onClick={resetState}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Start Over
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold">Full Name</h3>
                            <p className="text-muted-foreground">{extractedData.fullName}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Date of Birth</h3>
                            <p className="text-muted-foreground">{extractedData.dateOfBirth}</p>
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Vaccination History</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vaccine Name</TableHead>
                                    <TableHead>Date Administered</TableHead>
                                    <TableHead>Dose</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {extractedData.vaccines.map((vax, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{vax.vaccineName}</TableCell>
                                        <TableCell>{vax.date}</TableCell>
                                        <TableCell>{vax.dose || 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
