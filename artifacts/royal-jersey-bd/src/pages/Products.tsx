import { useState } from "react";
import { useListProducts, useListCategories, ProductEdition } from "@workspace/api-client-react";
import ProductCard from "@/components/products/ProductCard";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedEdition, setSelectedEdition] = useState<string | undefined>();
  const [inStockOnly, setInStockOnly] = useState(false);

  const { data: categories } = useListCategories();
  
  const { data: products, isLoading } = useListProducts({
    categoryId: selectedCategory,
    edition: selectedEdition as any,
    inStock: inStockOnly ? true : undefined
  });

  const editions = Object.values(ProductEdition);

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Categories
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="cat-all" 
              checked={selectedCategory === undefined}
              onCheckedChange={() => setSelectedCategory(undefined)}
            />
            <Label htmlFor="cat-all" className="cursor-pointer">All Categories</Label>
          </div>
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`cat-${cat.id}`} 
                checked={selectedCategory === cat.id}
                onCheckedChange={() => setSelectedCategory(cat.id)}
              />
              <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer">{cat.name} <span className="text-muted-foreground">({cat.productCount})</span></Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" /> Edition
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="ed-all" 
              checked={selectedEdition === undefined}
              onCheckedChange={() => setSelectedEdition(undefined)}
            />
            <Label htmlFor="ed-all" className="cursor-pointer">All Editions</Label>
          </div>
          {editions.map((ed) => (
            <div key={ed} className="flex items-center space-x-2">
              <Checkbox 
                id={`ed-${ed}`} 
                checked={selectedEdition === ed}
                onCheckedChange={() => setSelectedEdition(ed)}
              />
              <Label htmlFor={`ed-${ed}`} className="cursor-pointer capitalize">{ed}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Availability</h3>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="in-stock" 
            checked={inStockOnly}
            onCheckedChange={(c) => setInStockOnly(c as boolean)}
          />
          <Label htmlFor="in-stock" className="cursor-pointer">In Stock Only</Label>
        </div>
      </div>

      {(selectedCategory !== undefined || selectedEdition !== undefined || inStockOnly) && (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            setSelectedCategory(undefined);
            setSelectedEdition(undefined);
            setInStockOnly(false);
          }}
        >
          <X className="w-4 h-4 mr-2" /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="font-serif text-2xl font-bold mb-6">Filters</h2>
            <FilterSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold">
              {selectedCategory 
                ? categories?.find(c => c.id === selectedCategory)?.name 
                : "All Products"}
            </h1>
            
            {/* Mobile Filter Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  <Filter className="w-4 h-4 mr-2" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <SheetHeader className="mb-6 border-b pb-4">
                  <SheetTitle className="font-serif text-2xl">Filters</SheetTitle>
                </SheetHeader>
                <FilterSidebar />
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== undefined || selectedEdition !== undefined) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategory !== undefined && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm">
                  {categories?.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory(undefined)} className="ml-2 hover:text-destructive"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedEdition !== undefined && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm capitalize">
                  {selectedEdition}
                  <button onClick={() => setSelectedEdition(undefined)} className="ml-2 hover:text-destructive"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-lg">
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters to find what you're looking for.</p>
              <Button onClick={() => {
                setSelectedCategory(undefined);
                setSelectedEdition(undefined);
                setInStockOnly(false);
              }}>Clear All Filters</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
