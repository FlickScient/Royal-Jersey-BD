import { useState } from "react";
import { useListCategories, useAdminDeleteCategory } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Tag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCategories() {
  const { data: categories, isLoading } = useListCategories();
  const deleteCategory = useAdminDeleteCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", slug: "", imageUrl: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, name, slug: slugify(name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          imageUrl: formData.imageUrl.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create category");
      }
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      setIsDialogOpen(false);
      setFormData({ name: "", slug: "", imageUrl: "" });
      toast({ title: "Category created", description: `"${formData.name}" has been added.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    deleteCategory.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          toast({ title: "Category deleted", description: `"${name}" has been removed.` });
        },
        onError: (err: any) => {
          toast({ title: "Cannot delete", description: err?.data?.error || "Failed to delete category.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Categories</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage product categories. Categories are used to organize products in the store.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      <div className="bg-[#111] rounded-md border border-border/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/10 hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                </TableCell>
              </TableRow>
            ) : categories && categories.length > 0 ? categories.map((cat) => (
              <TableRow key={cat.id} className="border-border/10 hover:bg-white/5">
                <TableCell className="font-medium flex items-center gap-3">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  {cat.name}
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">{cat.slug}</TableCell>
                <TableCell>{cat.productCount ?? 0} products</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={deleteCategory.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  <Tag className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No categories yet</p>
                  <p className="text-sm mt-1">Create your first category to start adding products.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-[#111] border-border/10 text-foreground">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                required
                placeholder="e.g. Football Jerseys"
                value={formData.name}
                onChange={e => handleNameChange(e.target.value)}
                className="bg-background border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug <span className="text-muted-foreground text-xs">(auto-generated)</span></Label>
              <Input
                required
                placeholder="e.g. football-jerseys"
                value={formData.slug}
                onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="bg-background border-border/20 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="bg-background border-border/20"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
