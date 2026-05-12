import { useState } from "react";
import {
  useAdminListProducts,
  useAdminCreateProduct,
  useAdminUpdateProduct,
  useAdminDeleteProduct,
  useListCategories,
  useListLeagues,
  AdminProductBodyEdition,
  Product,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Image, PlusCircle, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAdminListProductsQueryKey, getListProductsQueryKey } from "@workspace/api-client-react";
import ImageUploadWidget from "@/components/admin/ImageUploadWidget";

const MAX_EXTRA_IMAGES = 9;

interface FormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  imageUrl: string;
  additionalImages: string[];
  categoryId: string;
  edition: AdminProductBodyEdition;
  fabricType: string;
  sizes: string;
  inStock: boolean;
  stockCount: string;
  isFeatured: boolean;
  isNew: boolean;
  discountPercent: string;
  leagueId: string;
  teamName: string;
  tags: string;
  variantPlayer: string;
  variantFan: string;
  variantThaiBD: string;
}

const EMPTY_FORM: FormData = {
  name: "", description: "", price: "", originalPrice: "",
  imageUrl: "", additionalImages: [],
  categoryId: "", edition: AdminProductBodyEdition.fan,
  fabricType: "", sizes: "S,M,L,XL,XXL",
  inStock: true, stockCount: "",
  isFeatured: false, isNew: true, discountPercent: "",
  leagueId: "", teamName: "", tags: "",
  variantPlayer: "", variantFan: "", variantThaiBD: "",
};

export default function AdminProducts() {
  const { data: products, isLoading } = useAdminListProducts();
  const { data: categories } = useListCategories();
  const { data: leagues } = useListLeagues();
  const queryClient = useQueryClient();

  const createProduct = useAdminCreateProduct();
  const updateProduct = useAdminUpdateProduct();
  const deleteProduct = useAdminDeleteProduct();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  const set = (patch: Partial<FormData>) => setFormData(prev => ({ ...prev, ...patch }));

  const handleOpenDialog = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      const p = product as any;
      let vp = { player: "", fan: "", "thai-bd": "" };
      try { if (p.variantPrices) vp = { ...vp, ...p.variantPrices }; } catch {}
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || "",
        imageUrl: product.imageUrl,
        additionalImages: (product.images ?? []).filter(Boolean),
        categoryId: product.categoryId.toString(),
        edition: product.edition as AdminProductBodyEdition,
        fabricType: product.fabricType || "",
        sizes: product.sizes?.join(",") || "S,M,L,XL,XXL",
        inStock: product.inStock,
        stockCount: product.stockCount?.toString() || "",
        isFeatured: product.isFeatured || false,
        isNew: product.isNew || false,
        discountPercent: product.discountPercent?.toString() || "",
        leagueId: product.leagueId?.toString() || "",
        teamName: product.teamName || "",
        tags: (p.tags ?? []).join(", "),
        variantPlayer: vp["player"] ? String(vp["player"]) : "",
        variantFan: vp["fan"] ? String(vp["fan"]) : "",
        variantThaiBD: vp["thai-bd"] ? String(vp["thai-bd"]) : "",
      });
    } else {
      setEditingProduct(null);
      setFormData({ ...EMPTY_FORM, categoryId: categories?.[0]?.id.toString() || "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) { alert("Please upload a product image first."); return; }

    const variantPricesObj: Record<string, number> = {};
    if (formData.variantPlayer) variantPricesObj["player"] = Number(formData.variantPlayer);
    if (formData.variantFan) variantPricesObj["fan"] = Number(formData.variantFan);
    if (formData.variantThaiBD) variantPricesObj["thai-bd"] = Number(formData.variantThaiBD);

    const payload: any = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      imageUrl: formData.imageUrl,
      images: formData.additionalImages.filter(Boolean),
      categoryId: Number(formData.categoryId),
      edition: formData.edition,
      fabricType: formData.fabricType,
      sizes: formData.sizes.split(",").map(s => s.trim()).filter(Boolean),
      inStock: formData.inStock,
      stockCount: formData.stockCount ? Number(formData.stockCount) : undefined,
      isFeatured: formData.isFeatured,
      isNew: formData.isNew,
      discountPercent: formData.discountPercent ? Number(formData.discountPercent) : undefined,
      leagueId: formData.leagueId && formData.leagueId !== "none" ? Number(formData.leagueId) : undefined,
      teamName: formData.teamName,
      tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      variantPrices: Object.keys(variantPricesObj).length > 0 ? JSON.stringify(variantPricesObj) : undefined,
    };

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      setIsDialogOpen(false);
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: payload }, { onSuccess });
    } else {
      createProduct.mutate({ data: payload }, { onSuccess });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this product?")) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        }
      });
    }
  };

  const addImageSlot = () => {
    if (formData.additionalImages.length < MAX_EXTRA_IMAGES) {
      set({ additionalImages: [...formData.additionalImages, ""] });
    }
  };

  const updateImageAt = (idx: number, url: string) => {
    const imgs = [...formData.additionalImages];
    imgs[idx] = url;
    set({ additionalImages: imgs });
  };

  const removeImageAt = (idx: number) => {
    set({ additionalImages: formData.additionalImages.filter((_, i) => i !== idx) });
  };

  const totalImages = 1 + formData.additionalImages.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold">Products</h2>
        <Button onClick={() => handleOpenDialog()}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
      </div>

      <div className="bg-[#111] rounded-md border border-border/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/10 hover:bg-transparent">
              <TableHead className="text-gray-300">Name</TableHead>
              <TableHead className="text-gray-300">Price</TableHead>
              <TableHead className="text-gray-300">Edition</TableHead>
              <TableHead className="text-gray-300">Stock</TableHead>
              <TableHead className="text-gray-300">Photos</TableHead>
              <TableHead className="text-right text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-300">Loading...</TableCell></TableRow>
            ) : products?.map((product) => {
              const p = product as any;
              const photoCount = 1 + (product.images?.filter(Boolean).length ?? 0);
              return (
                <TableRow key={product.id} className="border-border/10 hover:bg-white/5">
                  <TableCell className="font-medium flex items-center gap-3 text-gray-100">
                    <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Image className="w-4 h-4 text-muted-foreground" /></div>}
                    </div>
                    <div>
                      <div>{product.name}</div>
                      {product.teamName && <div className="text-xs text-gray-500">{product.teamName}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-200">
                    ৳{product.price}
                    {p.variantPrices && <div className="text-xs text-primary">Variants ✓</div>}
                  </TableCell>
                  <TableCell className="capitalize text-gray-200">{product.edition}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-gray-200 text-sm">
                        {product.stockCount != null ? `${product.stockCount} pcs` : product.inStock ? "In Stock" : "Out"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">{photoCount} photo{photoCount !== 1 ? "s" : ""}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(product.id)}><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111] border-border/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">

              {/* ── Main Image ─────────────────────────────────────── */}
              <div className="col-span-2">
                <Label className="mb-1.5 block text-gray-300">Main Photo <span className="text-xs text-gray-500">(required)</span></Label>
                <ImageUploadWidget
                  value={formData.imageUrl}
                  onChange={url => set({ imageUrl: url })}
                  onUploadingChange={setUploadingImage}
                  height="h-48"
                />
              </div>

              {/* ── Additional Photos ───────────────────────────────── */}
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-gray-300">
                    Additional Photos <span className="text-xs text-gray-500">({formData.additionalImages.length}/{MAX_EXTRA_IMAGES}) — up to 10 total</span>
                  </Label>
                  {formData.additionalImages.length < MAX_EXTRA_IMAGES && (
                    <Button type="button" variant="ghost" size="sm" onClick={addImageSlot} className="text-primary hover:text-primary h-7 px-2 text-xs">
                      <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Photo
                    </Button>
                  )}
                </div>
                {formData.additionalImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {formData.additionalImages.map((img, i) => (
                      <div key={i} className="relative">
                        <ImageUploadWidget
                          value={img}
                          onChange={url => updateImageAt(i, url)}
                          onUploadingChange={setUploadingImage}
                          height="h-28"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageAt(i)}
                          className="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-400"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={addImageSlot}
                    className="border border-dashed border-white/10 rounded-lg p-4 text-center text-gray-500 text-sm cursor-pointer hover:border-primary/40 hover:text-gray-400 transition-colors"
                  >
                    + Click to add back/side/detail shots (up to 9 extra)
                  </div>
                )}
                {totalImages > 1 && (
                  <p className="text-xs text-gray-500 mt-1">{totalImages} photos total — slider will auto-play every 2.5s on product page</p>
                )}
              </div>

              {/* ── Basic Info ──────────────────────────────────────── */}
              <div className="space-y-2">
                <Label className="text-gray-300">Name</Label>
                <Input required value={formData.name} onChange={e => set({ name: e.target.value })} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Team Name <span className="text-xs text-gray-500">(used in search)</span></Label>
                <Input value={formData.teamName} onChange={e => set({ teamName: e.target.value })} placeholder="e.g. Real Madrid, Barcelona" className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" />
              </div>

              {/* ── Variant Pricing ─────────────────────────────────── */}
              <div className="col-span-2 p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                <Label className="text-primary font-semibold block">Edition Variant Prices <span className="font-normal text-gray-400 text-xs">(leave blank to hide that variant)</span></Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-gray-300 text-xs">Player Edition (৳)</Label>
                    <Input type="number" value={formData.variantPlayer} onChange={e => set({ variantPlayer: e.target.value })} placeholder="e.g. 1500" className="bg-white/5 border-border/20 text-white placeholder:text-gray-500 h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-300 text-xs">Fan Edition (৳)</Label>
                    <Input type="number" value={formData.variantFan} onChange={e => set({ variantFan: e.target.value })} placeholder="e.g. 800" className="bg-white/5 border-border/20 text-white placeholder:text-gray-500 h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-300 text-xs">Thai-BD (৳)</Label>
                    <Input type="number" value={formData.variantThaiBD} onChange={e => set({ variantThaiBD: e.target.value })} placeholder="e.g. 600" className="bg-white/5 border-border/20 text-white placeholder:text-gray-500 h-9 text-sm" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">The default Price below is used when no variant is selected or when variants are not set.</p>
              </div>

              {/* ── Pricing ─────────────────────────────────────────── */}
              <div className="space-y-2">
                <Label className="text-gray-300">Default Price (৳)</Label>
                <Input required type="number" value={formData.price} onChange={e => set({ price: e.target.value })} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Original Price <span className="text-xs text-gray-500">(for strikethrough)</span></Label>
                <Input type="number" value={formData.originalPrice} onChange={e => set({ originalPrice: e.target.value })} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Stock Count</Label>
                <Input type="number" min="0" value={formData.stockCount} onChange={e => set({ stockCount: e.target.value })} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" placeholder="e.g. 50" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Discount %</Label>
                <Input type="number" value={formData.discountPercent} onChange={e => set({ discountPercent: e.target.value })} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" placeholder="e.g. 10" />
              </div>

              {/* ── Meta ────────────────────────────────────────────── */}
              <div className="space-y-2">
                <Label className="text-gray-300">Category</Label>
                <Select value={formData.categoryId} onValueChange={v => set({ categoryId: v })}>
                  <SelectTrigger className="bg-white/5 border-border/20 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Default Edition</Label>
                <Select value={formData.edition} onValueChange={v => set({ edition: v as AdminProductBodyEdition })}>
                  <SelectTrigger className="bg-white/5 border-border/20 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {Object.values(AdminProductBodyEdition).map(e => <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Fabric Type</Label>
                <Input value={formData.fabricType} onChange={e => set({ fabricType: e.target.value })} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" placeholder="e.g. Lorex, Box Mash" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">League</Label>
                <Select value={formData.leagueId} onValueChange={v => set({ leagueId: v })}>
                  <SelectTrigger className="bg-white/5 border-border/20 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {leagues?.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-gray-300">Search Tags <span className="text-xs text-gray-500">(comma-separated keywords)</span></Label>
                <Input value={formData.tags} onChange={e => set({ tags: e.target.value })} placeholder="e.g. Real Madrid, La Liga, Bellingham, White Jersey" className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-gray-300">Sizes <span className="text-xs text-gray-500">(comma-separated)</span></Label>
                <Input value={formData.sizes} onChange={e => set({ sizes: e.target.value })} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-gray-300">Description</Label>
                <Textarea value={formData.description} onChange={e => set({ description: e.target.value })} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" />
              </div>

              <div className="col-span-2 grid grid-cols-3 gap-4 pt-4 border-t border-border/10">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">In Stock</Label>
                  <Switch checked={formData.inStock} onCheckedChange={c => set({ inStock: c })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Featured</Label>
                  <Switch checked={formData.isFeatured} onCheckedChange={c => set({ isFeatured: c })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Is New</Label>
                  <Switch checked={formData.isNew} onCheckedChange={c => set({ isNew: c })} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-gray-300 hover:text-white">Cancel</Button>
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending || uploadingImage}>
                {uploadingImage ? "Uploading..." : createProduct.isPending || updateProduct.isPending ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
