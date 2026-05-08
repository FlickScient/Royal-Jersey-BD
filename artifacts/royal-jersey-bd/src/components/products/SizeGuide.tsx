import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ruler } from "lucide-react";

export default function SizeGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="px-0 text-muted-foreground hover:text-primary h-auto p-0">
          <Ruler className="w-4 h-4 mr-2" /> Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl mb-4">Size Guide</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold text-foreground">Size</th>
                <th className="px-6 py-4 font-semibold text-foreground">Chest (inches)</th>
                <th className="px-6 py-4 font-semibold text-foreground">Length (inches)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/30">
                <td className="px-6 py-4 font-medium text-foreground">S</td>
                <td className="px-6 py-4 text-muted-foreground">38"</td>
                <td className="px-6 py-4 text-muted-foreground">27"</td>
              </tr>
              <tr className="hover:bg-muted/30 bg-muted/10">
                <td className="px-6 py-4 font-medium text-foreground">M</td>
                <td className="px-6 py-4 text-muted-foreground">40"</td>
                <td className="px-6 py-4 text-muted-foreground">28"</td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="px-6 py-4 font-medium text-foreground">L</td>
                <td className="px-6 py-4 text-muted-foreground">42"</td>
                <td className="px-6 py-4 text-muted-foreground">29"</td>
              </tr>
              <tr className="hover:bg-muted/30 bg-muted/10">
                <td className="px-6 py-4 font-medium text-foreground">XL</td>
                <td className="px-6 py-4 text-muted-foreground">44"</td>
                <td className="px-6 py-4 text-muted-foreground">30"</td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="px-6 py-4 font-medium text-foreground">XXL</td>
                <td className="px-6 py-4 text-muted-foreground">46"</td>
                <td className="px-6 py-4 text-muted-foreground">31"</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>* Measurements may vary by 0.5-1 inch due to manual measurement.</p>
          <p>* Player editions are tighter fitting than Fan editions. Consider sizing up for Player editions if you prefer a looser fit.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
