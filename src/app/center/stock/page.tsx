
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, PackagePlus } from 'lucide-react';
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getCenterStock, addVaccine, updateVaccineStock, deleteVaccineStock } from './actions';
import { Label } from '@/components/ui/label';

type Vaccine = {
  _id: string;
  vaccineName: string;
  totalStock: number;
  remainingStock: number;
  usedDoses: number;
  wastedDoses: number;
};

export default function StockManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [stock, setStock] = React.useState<Vaccine[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [centerId, setCenterId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>("");
  const [stockLevels, setStockLevels] = React.useState<{ [key: string]: { remainingStock: number; usedDoses: number; wastedDoses: number } }>({});
  const [newVaccineName, setNewVaccineName] = React.useState('');
  const [newVaccineQuantity, setNewVaccineQuantity] = React.useState<number>(0);
  const [isAddVaccineDialogOpen, setAddVaccineDialogOpen] = React.useState(false);


  const fetchStockData = React.useCallback(async (id: string) => {
    setIsLoading(true);
    const result = await getCenterStock(id);
    if (result.success && result.stock) {
      setStock(result.stock);

      const initialStockLevels = result.stock.reduce((acc, s) => {
        acc[s._id] = { remainingStock: s.remainingStock, usedDoses: s.usedDoses, wastedDoses: s.wastedDoses };
        return acc;
      }, {} as typeof stockLevels);
      setStockLevels(initialStockLevels);

      if (!activeTab || !result.stock.some(s => s._id === activeTab)) {
        setActiveTab(result.stock[0]?._id || "");
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed to load stock data',
        description: result.error || 'An unknown error occurred.',
      });
    }
    setIsLoading(false);
  }, [toast, activeTab]);

  React.useEffect(() => {
    const storedCenter = localStorage.getItem('center');
    if (storedCenter) {
      const parsedCenter = JSON.parse(storedCenter);
      if (parsedCenter?._id && parsedCenter?.role === 'center') {
        const id = parsedCenter._id;
        setCenterId(id);
        fetchStockData(id);
      } else {
        router.push('/center/login');
      }
    } else {
      router.push('/center/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleStockUpdate = async (vaccineId: string) => {
    if (!centerId || !stockLevels[vaccineId]) return;

    const result = await updateVaccineStock({
        vaccineId: vaccineId,
        ...stockLevels[vaccineId]
    });

    if (result.success) {
      toast({ title: 'Stock Updated', description: `Stock has been updated.` });
      fetchStockData(centerId);
    } else {
      toast({ variant: 'destructive', title: 'Update Failed', description: result.error });
    }
  };

  const handleAddVaccine = async () => {
    if (!centerId || !newVaccineName.trim()) {
        toast({ variant: 'destructive', title: 'Invalid Name', description: 'Vaccine name cannot be empty.' });
        return;
    }
    
    const newVaccineData = {
      vaccineName: newVaccineName.trim(),
      totalStock: newVaccineQuantity
    };

    const result = await addVaccine(centerId, newVaccineData);

    if (result.success) {
        toast({ title: 'Vaccine Added', description: `${newVaccineName} has been added to your inventory.`});
        setNewVaccineName('');
        setNewVaccineQuantity(0);
        setAddVaccineDialogOpen(false);
        fetchStockData(centerId);
    } else {
        toast({ variant: 'destructive', title: 'Failed to Add', description: result.error });
    }
  };

  const handleDeleteVaccine = async (vaccineId: string) => {
    if (!centerId) return;

    const result = await deleteVaccineStock(vaccineId);
    if(result.success) {
        toast({title: 'Vaccine Removed', description: `Vaccine has been removed from inventory.`});
        setActiveTab(""); 
        fetchStockData(centerId);
    } else {
        toast({variant: 'destructive', title: 'Deletion Failed', description: result.error});
    }
  }
  
  if (isLoading && stock.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 flex items-center justify-center">
              <p>Loading Stock Management...</p>
          </main>
          <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold font-headline">Stock Management</h1>
                <p className="text-muted-foreground">Add, update, and manage vaccine inventory for your center.</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Vaccine Inventory</CardTitle>
                    <CardDescription>Update vaccine dose counts for each type.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex items-center border-b">
                            <TabsList className="flex-1 h-auto justify-start rounded-none bg-transparent p-0 border-none">
                                {stock.map(s => (
                                    <TabsTrigger key={s._id} value={s._id} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent">
                                      {s.vaccineName}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                             <Dialog open={isAddVaccineDialogOpen} onOpenChange={setAddVaccineDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="ml-2"><PackagePlus className="h-4 w-4 mr-2" />Add Vaccine</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Vaccine Type</DialogTitle>
                                        <DialogDescription>Enter the name and initial stock count for the new vaccine.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="vaccine-name">Vaccine Name</Label>
                                            <Input 
                                                id="vaccine-name"
                                                placeholder="e.g., Typhoid"
                                                value={newVaccineName}
                                                onChange={(e) => setNewVaccineName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="stock-count">Initial Stock Count</Label>
                                            <Input
                                                id="stock-count"
                                                type="number"
                                                placeholder="0"
                                                value={newVaccineQuantity}
                                                onChange={(e) => setNewVaccineQuantity(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setAddVaccineDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={handleAddVaccine}>Add Vaccine</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        {stock.map(s => (
                            <TabsContent key={s._id} value={s._id} className="space-y-4 pt-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Remaining Doses</label>
                                        <Input 
                                            type="number" 
                                            value={stockLevels[s._id]?.remainingStock ?? 0}
                                            onChange={(e) => setStockLevels(prev => ({...prev, [s._id]: {...prev[s._id], remainingStock: Number(e.target.value)}}))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Doses Used</label>
                                        <Input 
                                            type="number" 
                                            value={stockLevels[s._id]?.usedDoses ?? 0}
                                            onChange={(e) => setStockLevels(prev => ({...prev, [s._id]: {...prev[s._id], usedDoses: Number(e.target.value)}}))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Wasted Doses</label>
                                        <Input 
                                            type="number" 
                                            value={stockLevels[s._id]?.wastedDoses ?? 0}
                                            onChange={(e) => setStockLevels(prev => ({...prev, [s._id]: {...prev[s._id], wastedDoses: Number(e.target.value)}}))}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button className="flex-1" onClick={() => handleStockUpdate(s._id)}>
                                        Update Stock for {s.vaccineName}
                                    </Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete {s.vaccineName}?</AlertDialogTitle>
                                                <AlertDialogDescription>This will permanently remove {s.vaccineName} from your inventory. This cannot be undone.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteVaccine(s._id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                <div className="text-sm text-muted-foreground pt-2">Total Doses in Inventory: {s.totalStock}</div>
                            </TabsContent>
                        ))}
                         {stock.length === 0 && !isLoading && (
                            <div className="pt-8 text-center text-muted-foreground">
                                No vaccine types in inventory. Click the 'Add Vaccine' button to get started.
                            </div>
                        )}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
