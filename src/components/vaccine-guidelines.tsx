
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Info } from "lucide-react"

export function VaccineGuidelines() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary"/>
            Preservation Guidelines
        </CardTitle>
        <CardDescription>Key storage and handling instructions for vaccines.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
            <h4 className="font-semibold text-blue-800">Temperature Control</h4>
            <p className="text-blue-700">Store vaccines at 2°C to 8°C (36°F to 46°F). Do not freeze. Use a calibrated thermometer to monitor temperatures daily.</p>
        </div>
         <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200">
            <h4 className="font-semibold text-yellow-800">Light Exposure</h4>
            <p className="text-yellow-700">Keep vaccines in their original packaging to protect them from light, which can reduce potency.</p>
        </div>
         <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <h4 className="font-semibold text-red-800">Handling</h4>
            <p className="text-red-700">Handle vaccines with care. Avoid shaking vials vigorously. Follow specific reconstitution instructions for each vaccine type.</p>
        </div>
      </CardContent>
    </Card>
  )
}
