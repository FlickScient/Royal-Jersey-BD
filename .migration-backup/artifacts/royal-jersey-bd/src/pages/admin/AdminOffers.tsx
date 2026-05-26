import { useState } from "react";
import { 
  useAdminListOffers, 
  useAdminCreateOffer, 
  useAdminUpdateOffer, 
  useAdminDeleteOffer,
  Offer,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAdminListOffersQueryKey } from "@workspace/api-client-react";
import { toast } from "sonner";

export default function AdminOffers() {
  const { data: offers, isLoading } = useAdminListOffers();
  const queryClient = useQueryClient();

  const createOffer = useAdminCreateOffer();
  const updateOffer = useAdminUpdateOffer();
  const deleteOffer = useAdminDeleteOffer();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountPercent: "",
    imageUrl: "",
    validUntil: "",
    code: "",
    isActive: true,
  });

  const handleOpenDialog = (offer: Offer | null = null) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        title: offer.title,
        description: offer.description,
        discountPercent: offer.discountPercent?.toString() || "",
        imageUrl: offer.imageUrl || "",
        validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().slice(0, 16) : "",
        code: offer.code || "",
        isActive: offer.isActive !== undefined ? offer.isActive : true,
      });
    } else {
      setEditingOffer(null);
      setFormData({
        title: "",
        description: "",
        discountPercent: "",
        imageUrl: "",
        validUntil: "",
        code: "",
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleToggle = async (offer: Offer) => {
    setTogglingId(offer.id);
    try {
      await fetch(`/api/admin/offers/${offer.id}/toggle`, { method: "PATCH" });
      queryClient.invalidateQueries({ queryKey: getAdminListOffersQueryKey() });
      toast.success(`Offer ${offer.isActive ? "hidden" : "shown"} successfully`);
    } catch {
      toast.error("Failed to toggle offer");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description,
      discountPercent: formData.discountPercent ? Number(formData.discountPercent) : undefined,
      imageUrl: formData.imageUrl || undefined,
      validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
      code: formData.code || undefined,
      isActive: formData.isActive,
    };

    if (editingOffer) {
      updateOffer.mutate(
        { id: editingOffer.id, data: payload as any },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getAdminListOffersQueryKey() });
            setIsDialogOpen(false);
            toast.success("Offer updated successfully");
          },
          onError: () => toast.error("Failed to update offer"),
        }
      );
    } else {
      createOffer.mutate(
        { data: payload as any },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getAdminListOffersQueryKey() });
            setIsDialogOpen(false);
            toast.success("Offer created successfully");
          },
          onError: () => toast.error("Failed to create offer"),
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      deleteOffer.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getAdminListOffersQueryKey() });
            toast.success("Offer deleted");
          },
          onError: () => toast.error("Failed to delete offer"),
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold">Offers</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Add Offer
        </Button>
      </div>

      <div className="bg-[#111] rounded-md border border-border/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/10 hover:bg-transparent">
              <TableHead>Title</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : offers?.map((offer) => (
              <TableRow key={offer.id} className="border-border/10 hover:bg-white/5">
                <TableCell className="font-medium">{offer.title}</TableCell>
                <TableCell>{offer.discountPercent ? `${offer.discountPercent}%` : '-'}</TableCell>
                <TableCell>
                  {offer.code ? (
                    <code className="bg-white/10 px-2 py-0.5 rounded text-xs">{offer.code}</code>
                  ) : '-'}
                </TableCell>
                <TableCell>{offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : 'Never'}</TableCell>
                <TableCell>
                  <button
                    onClick={() => handleToggle(offer)}
                    disabled={togglingId === offer.id}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                      offer.isActive
                        ? "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    {offer.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {offer.isActive ? "Active" : "Hidden"}
                  </button>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(offer)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(offer.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!offers?.length && !isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No offers found. Add your first offer!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl bg-[#111] border-border/10 text-foreground">
          <DialogHeader>
            <DialogTitle>{editingOffer ? 'Edit Offer' : 'Add Offer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background border-border/20" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background border-border/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount % (Optional)</Label>
                <Input type="number" min="0" max="100" value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: e.target.value})} className="bg-background border-border/20" />
              </div>
              <div className="space-y-2">
                <Label>Promo Code (Optional)</Label>
                <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="bg-background border-border/20 uppercase" placeholder="e.g. SUMMER20" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL (Optional)</Label>
              <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="bg-background border-border/20" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Valid Until (Optional)</Label>
              <Input type="datetime-local" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} className="bg-background border-border/20" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/20">
              <div>
                <Label className="text-sm font-medium">Active / Visible</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Show this offer on the public site</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createOffer.isPending || updateOffer.isPending}>
                {createOffer.isPending || updateOffer.isPending ? 'Saving...' : 'Save Offer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
