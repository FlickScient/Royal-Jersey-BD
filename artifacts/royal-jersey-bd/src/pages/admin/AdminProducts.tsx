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
import { Plus, Edit, Trash2, Image } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAdminListProductsQueryKey, getListProductsQueryKey } from "@workspace/api-client-react";
import ImageUploadWidget from "@/components/admin/ImageUploadWidget";

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

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    originalPrice: string;
    imageUrl: string;
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
  }>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    imageUrl: "",
    categoryId: "",
    edition: AdminProductBodyEdition.fan,
    fabricType: "",
    sizes: "S,M,L,XL",
    inStock: true,
    stockCount: "",
    isFeatured: false,
    isNew: true,
    discountPercent: "",
    leagueId: "",
    teamName: ""
  });

  const handleOpenDialog = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || "",
        imageUrl: product.imageUrl,
        categoryId: product.categoryId.toString(),
        edition: product.edition as AdminProductBodyEdition,
        fabricType: product.fabricType || "",
        sizes: product.sizes?.join(",") || "S,M,L,XL",
        inStock: product.inStock,
        stockCount: product.stockCount?.toString() || "",
        isFeatured: product.isFeatured || false,
        isNew: product.isNew || false,
        discountPercent: product.discountPercent?.toString() || "",
        leagueId: product.leagueId?.toString() || "",
        teamName: product.teamName || ""
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        imageUrl: "",
        categoryId: categories?.[0]?.id.toString() || "",
        edition: AdminProductBodyEdition.fan,
        fabricType: "",
        sizes: "S,M,L,XL",
        inStock: true,
        stockCount: "",
        isFeatured: false,
        isNew: true,
        discountPercent: "",
        leagueId: "",
        teamName: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert("Please upload a product image first.");
      return;
    }
    
    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      imageUrl: formData.imageUrl,
      categoryId: Number(formData.categoryId),
      edition: formData.edition,
      fabricType: formData.fabricType,
      sizes: formData.sizes.split(",").map(s => s.trim()),
      inStock: formData.inStock,
      stockCount: formData.stockCount ? Number(formData.stockCount) : undefined,
      isFeatured: formData.isFeatured,
      isNew: formData.isNew,
      discountPercent: formData.discountPercent ? Number(formData.discountPercent) : undefined,
      leagueId: formData.leagueId && formData.leagueId !== "none" ? Number(formData.leagueId) : undefined,
      teamName: formData.teamName
    };

    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            setIsDialogOpen(false);
          }
        }
      );
    } else {
      createProduct.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            setIsDialogOpen(false);
          }
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          }
        }
      );
    }
  };

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
              <TableHead className="text-gray-300">Featured</TableHead>
              <TableHead className="text-right text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-300">Loading...</TableCell></TableRow>
            ) : products?.map((product) => (
              <TableRow key={product.id} className="border-border/10 hover:bg-white/5">
                <TableCell className="font-medium flex items-center gap-3 text-gray-100">
                  <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Image className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {product.name}
                </TableCell>
                <TableCell className="text-gray-200">৳{product.price}</TableCell>
                <TableCell className="capitalize text-gray-200">{product.edition}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-gray-200">
                      {product.stockCount != null ? `${product.stockCount} pcs` : (product.inStock ? 'In Stock' : 'Out')}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-200">{product.isFeatured ? 'Yes' : 'No'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(product.id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111] border-border/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="mb-1.5 block text-gray-300">Product Image</Label>
                <ImageUploadWidget
                  value={formData.imageUrl}
                  onChange={url => setFormData(prev => ({ ...prev, imageUrl: url }))}
                  onUploadingChange={setUploadingImage}
                  height="h-48"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Price (৳)</Label>
                <Input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Original Price (Optional)</Label>
                <Input type="number" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Stock Count (Optional)</Label>
                <Input type="number" min="0" value={formData.stockCount} onChange={e => setFormData({...formData, stockCount: e.target.value})} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" placeholder="e.g. 50" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Category</Label>
                <Select value={formData.categoryId} onValueChange={v => setFormData({...formData, categoryId: v})}>
                  <SelectTrigger className="bg-white/5 border-border/20 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Edition</Label>
                <Select value={formData.edition} onValueChange={v => setFormData({...formData, edition: v as AdminProductBodyEdition})}>
                  <SelectTrigger className="bg-white/5 border-border/20 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {Object.values(AdminProductBodyEdition).map(e => <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Fabric Type</Label>
                <Input value={formData.fabricType} onChange={e => setFormData({...formData, fabricType: e.target.value})} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" placeholder="e.g. Lorex, Box Mash" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Discount % (Optional)</Label>
                <Input type="number" value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: e.target.value})} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" placeholder="e.g. 10" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">League (Optional)</Label>
                <Select value={formData.leagueId} onValueChange={v => setFormData({...formData, leagueId: v})}>
                  <SelectTrigger className="bg-white/5 border-border/20 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {leagues?.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Team Name (Optional)</Label>
                <Input value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-gray-300">Sizes (Comma separated)</Label>
                <Input value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-gray-300">Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-white/5 border-border/20 text-white placeholder:text-gray-500" />
              </div>
              
              <div className="col-span-2 grid grid-cols-3 gap-4 pt-4 border-t border-border/10">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">In Stock</Label>
                  <Switch checked={formData.inStock} onCheckedChange={c => setFormData({...formData, inStock: c})} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Featured</Label>
                  <Switch checked={formData.isFeatured} onCheckedChange={c => setFormData({...formData, isFeatured: c})} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Is New</Label>
                  <Switch checked={formData.isNew} onCheckedChange={c => setFormData({...formData, isNew: c})} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-gray-300 hover:text-white">Cancel</Button>
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending || uploadingImage}>
                {uploadingImage ? 'Uploading...' : createProduct.isPending || updateProduct.isPending ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
