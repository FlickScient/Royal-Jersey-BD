import { useState } from "react";
import { useListLeagues } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Trophy, Globe } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListLeaguesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import ImageUploadWidget from "@/components/admin/ImageUploadWidget";

interface League {
  id: number;
  name: string;
  slug: string;
  country?: string;
  logoUrl?: string;
  isInternational: boolean;
  sortOrder?: number;
  productCount?: number;
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  country: "",
  logoUrl: "",
  isInternational: false,
  sortOrder: "0",
};

type FormData = typeof EMPTY_FORM;

export default function AdminLeagues() {
  const { data: leagues, isLoading } = useListLeagues();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, name, slug: editingLeague ? prev.slug : slugify(name) }));
  };

  const openAddDialog = () => {
    setEditingLeague(null);
    setFormData(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEditDialog = (league: League) => {
    setEditingLeague(league);
    setFormData({
      name: league.name,
      slug: league.slug,
      country: league.country ?? "",
      logoUrl: league.logoUrl ?? "",
      isInternational: league.isInternational,
      sortOrder: String(league.sortOrder ?? 0),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) return;
    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      country: formData.country.trim() || undefined,
      logoUrl: formData.logoUrl.trim() || undefined,
      isInternational: formData.isInternational,
      sortOrder: parseInt(formData.sortOrder) || 0,
    };

    try {
      const url = editingLeague ? `/api/admin/leagues/${editingLeague.id}` : "/api/admin/leagues";
      const method = editingLeague ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save league");
      }
      await queryClient.invalidateQueries({ queryKey: getListLeaguesQueryKey() });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/leagues"] });
      setIsDialogOpen(false);
      toast({ title: editingLeague ? "League updated" : "League created", description: `"${formData.name}" has been ${editingLeague ? "updated" : "added"}.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (league: League) => {
    if (!confirm(`Delete league "${league.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/leagues/${league.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete league");
      }
      await queryClient.invalidateQueries({ queryKey: getListLeaguesQueryKey() });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/leagues"] });
      toast({ title: "League deleted", description: `"${league.name}" has been removed.` });
    } catch (err: any) {
      toast({ title: "Cannot delete", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Leagues</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage football leagues and competitions shown on the site.</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" /> Add League
        </Button>
      </div>

      <div className="bg-[#111] rounded-md border border-border/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/10 hover:bg-transparent">
              <TableHead>League</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                </TableCell>
              </TableRow>
            ) : leagues && leagues.length > 0 ? leagues.map((league) => (
              <TableRow key={league.id} className="border-border/10 hover:bg-white/5">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {league.logoUrl ? (
                      <img src={league.logoUrl} alt="" className="w-8 h-8 rounded object-contain bg-white/5 p-0.5" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    {league.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">{league.slug}</TableCell>
                <TableCell className="text-muted-foreground">{league.country ?? "—"}</TableCell>
                <TableCell>
                  {league.isInternational ? (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                      <Globe className="w-3 h-3" /> International
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Domestic</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{league.sortOrder ?? 0}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(league as League)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(league as League)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No leagues yet</p>
                  <p className="text-sm mt-1">Add leagues to let customers browse jerseys by competition.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-[#111] border-border/10 text-foreground">
          <DialogHeader>
            <DialogTitle>{editingLeague ? "Edit League" : "Add League"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>League Name</Label>
              <Input
                required
                placeholder="e.g. Premier League"
                value={formData.name}
                onChange={e => handleNameChange(e.target.value)}
                className="bg-background border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug <span className="text-muted-foreground text-xs">(auto-generated)</span></Label>
              <Input
                required
                placeholder="e.g. premier-league"
                value={formData.slug}
                onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="bg-background border-border/20 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Country <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  placeholder="e.g. England"
                  value={formData.country}
                  onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="bg-background border-border/20"
                />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={e => setFormData(prev => ({ ...prev, sortOrder: e.target.value }))}
                  className="bg-background border-border/20"
                  placeholder="0"
                />
              </div>
            </div>
            <ImageUploadWidget
              label="League Logo (optional)"
              value={formData.logoUrl}
              onChange={url => setFormData(prev => ({ ...prev, logoUrl: url }))}
              height="h-24"
            />
            <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/20">
              <div>
                <Label className="text-sm font-medium">International Competition</Label>
                <p className="text-xs text-muted-foreground mt-0.5">e.g. UEFA Champions League, FIFA World Cup</p>
              </div>
              <Switch
                checked={formData.isInternational}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, isInternational: checked }))}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingLeague ? "Update League" : "Create League"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
