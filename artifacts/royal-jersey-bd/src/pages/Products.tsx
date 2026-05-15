import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { useListProducts, useListCategories, useListLeagues, ListProductsSort } from "@workspace/api-client-react";
import ProductCard from "@/components/products/ProductCard";
import { Filter, SlidersHorizontal, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const EDITIONS = [
  { value: "player", label: "Player Edition" },
  { value: "fan", label: "Fan Edition" },
  { value: "kid", label: "Kid Edition" },
  { value: "premium", label: "Premium" },
];

export default function Products() {
  const rawSearch = useSearch();

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedEdition, setSelectedEdition] = useState<string | undefined>();
  const [selectedLeague, setSelectedLeague] = useState<number | undefined>();
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<ListProductsSort>(ListProductsSort.newest);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");

  useEffect(() => {
  const params = new URLSearchParams(rawSearch);
  const ed = params.get("edition");
  const catId = params.get("categoryId");
  const catSlug = params.get("category");
  const lgId = params.get("leagueId");
  const q = params.get("search");
  const collection = params.get("collection");
  if (ed) setSelectedEdition(ed);
  if (catId) setSelectedCategory(Number(catId));
  if (lgId) setSelectedLeague(Number(lgId));
  if (q) { setSearchQuery(q); setSearchInput(q); }
  if (collection === "new") setSelectedEdition("new");
  if (catSlug && catSlug !== "") {
    // Will be resolved after categories load
    (window as any).__pendingCatSlug = catSlug;
  }
}, []);

  const { data: categories } = useListCategories();
  const { data: leagues } = useListLeagues();

  const { data: products, isLoading } = useListProducts({
    categoryId: selectedCategory,
    edition: selectedEdition as any,
    leagueId: selectedLeague,
    inStock: inStockOnly ? true : undefined,
    sort,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    search: searchQuery || undefined,
  });

  const clearAll = () => {
    setSelectedCategory(undefined);
    setSelectedEdition(undefined);
    setSelectedLeague(undefined);
    setInStockOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
    setSearchInput("");
  };

  const hasFilters = selectedCategory !== undefined || selectedEdition !== undefined
    || selectedLeague !== undefined || inStockOnly || minPrice || maxPrice || searchQuery;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Categories
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="cat-all" checked={selectedCategory === undefined} onCheckedChange={() => setSelectedCategory(undefined)} />
            <Label htmlFor="cat-all" className="cursor-pointer">All Categories</Label>
          </div>
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox id={`cat-${cat.id}`} checked={selectedCategory === cat.id} onCheckedChange={() => setSelectedCategory(cat.id)} />
              <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer">
                {cat.name} <span className="text-muted-foreground">({cat.productCount})</span>
              </Label>
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
            <Checkbox id="ed-all" checked={selectedEdition === undefined} onCheckedChange={() => setSelectedEdition(undefined)} />
            <Label htmlFor="ed-all" className="cursor-pointer">All Editions</Label>
          </div>
          {EDITIONS.map((ed) => (
            <div key={ed.value} className="flex items-center space-x-2">
              <Checkbox id={`ed-${ed.value}`} checked={selectedEdition === ed.value} onCheckedChange={() => setSelectedEdition(ed.value)} />
              <Label htmlFor={`ed-${ed.value}`} className="cursor-pointer">{ed.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">League</h3>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="lg-all" checked={selectedLeague === undefined} onCheckedChange={() => setSelectedLeague(undefined)} />
            <Label htmlFor="lg-all" className="cursor-pointer">All Leagues</Label>
          </div>
          {leagues?.map((lg) => (
            <div key={lg.id} className="flex items-center space-x-2">
              <Checkbox id={`lg-${lg.id}`} checked={selectedLeague === lg.id} onCheckedChange={() => setSelectedLeague(lg.id)} />
              <Label htmlFor={`lg-${lg.id}`} className="cursor-pointer">{lg.name}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="flex items-center space-x-2">
          <Input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-24" />
          <span>-</span>
          <Input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-24" />
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Availability</h3>
        <div className="flex items-center space-x-2">
          <Checkbox id="in-stock" checked={inStockOnly} onCheckedChange={(c) => setInStockOnly(c as boolean)} />
          <Label htmlFor="in-stock" className="cursor-pointer">In Stock Only</Label>
        </div>
      </div>

      {hasFilters && (
        <Button variant="outline" className="w-full" onClick={clearAll}>
          <X className="w-4 h-4 mr-2" /> Clear All Filters
        </Button>
      )}
    </div>
  );

  const pageTitle = selectedEdition
    ? EDITIONS.find(e => e.value === selectedEdition)?.label ?? "Products"
    : selectedCategory
      ? (categories?.find(c => c.id === selectedCategory)?.name ?? "Products")
      : selectedLeague
        ? (leagues?.find(l => l.id === selectedLeague)?.name ?? "Products")
        : searchQuery
          ? `Results for "${searchQuery}"`
          : "All Products";

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search jerseys, teams, leagues…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
        <Button type="submit" className="h-11 px-5">Search</Button>
        {searchQuery && (
          <Button type="button" variant="ghost" size="icon" className="h-11 w-11" onClick={() => { setSearchQuery(""); setSearchInput(""); }}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </form>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
            <h2 className="font-serif text-2xl font-bold mb-6">Filters</h2>
            <FilterSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold">{pageTitle}</h1>
              {products && <p className="text-sm text-muted-foreground mt-1">{products.length} items</p>}
            </div>

            <div className="flex items-center gap-3">
              <Select value={sort} onValueChange={(v) => setSort(v as ListProductsSort)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ListProductsSort.newest}>Newest</SelectItem>
                  <SelectItem value={ListProductsSort.price_asc}>Price: Low to High</SelectItem>
                  <SelectItem value={ListProductsSort.price_desc}>Price: High to Low</SelectItem>
                  <SelectItem value={ListProductsSort.popular}>Most Popular</SelectItem>
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Filter className="w-4 h-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetHeader className="mb-6 border-b pb-4">
                    <SheetTitle className="font-serif text-2xl">Filters</SheetTitle>
                  </SheetHeader>
                  <FilterSidebar />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm border border-primary/20">
                  "{searchQuery}" <button onClick={() => { setSearchQuery(""); setSearchInput(""); }} className="ml-2"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedEdition && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm capitalize">
                  {EDITIONS.find(e => e.value === selectedEdition)?.label ?? selectedEdition}
                  <button onClick={() => setSelectedEdition(undefined)} className="ml-2 hover:text-destructive"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedCategory !== undefined && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm">
                  {categories?.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory(undefined)} className="ml-2 hover:text-destructive"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedLeague !== undefined && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm">
                  {leagues?.find(l => l.id === selectedLeague)?.name}
                  <button onClick={() => setSelectedLeague(undefined)} className="ml-2 hover:text-destructive"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />)}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-lg">
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different team name, jersey type, or league.`
                  : "Try adjusting your filters."}
              </p>
              <Button onClick={clearAll}>Clear All Filters</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
