import { useState } from "react";
import { useListCategories, useAdminDeleteCategory, useAdminCreateCategory, useAdminUpdateCategory } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Tag, Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@workspace/api-client-react";

export default function AdminCategories() {
  const { data: categories, isLoading } = useListCategories();
  const deleteCategory = useAdminDeleteCategory();
  const createCategory = useAdminCreateCategory();
  const updateCategory = useAdminUpdateCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", imageUrl: "" });

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, name, slug: editingCategory ? prev.slug : slugify(name) }));
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", imageUrl: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, slug: cat.slug, imageUrl: cat.imageUrl ?? "" });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) return;

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      imageUrl: formData.imageUrl.trim() || undefined,
    };

    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
            setIsDialogOpen(false);
            toast({ title: "Category updated", description: `"${formData.name}" has been updated.` });
          },
          onError: (err: any) => {
            toast({ title: "Error", description: err?.data?.error || "Failed to update category.", variant: "destructive" });
          },
        }
      );
    } else {
      createCategory.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
            setIsDialogOpen(false);
            setFormData({ name: "", slug: "", imageUrl: "" });
            toast({ title: "Category created", description: `"${formData.name}" has been added.` });
          },
          onError: (err: any) => {
            toast({ title: "Error", description: err?.data?.error || "Failed to create category.", variant: "destructive" });
          },
        }
      );
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
        <Button onClick={openAddDialog}>
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
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(cat)}>
                    <Edit className="w-4 h-4" />
                  </Button>
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
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
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
              <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                {createCategory.isPending || updateCategory.isPending
                  ? "Saving..."
                  : editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
