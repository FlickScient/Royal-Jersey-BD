import { useState } from "react";
import { useListProducts, useListCategories, useListLeagues, ListProductsSort } from "@workspace/api-client-react";
import ProductCard from "@/components/products/ProductCard";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export default function Jerseys() {
  const [selectedLeague, setSelectedLeague] = useState<number | undefined>();
  const [sort, setSort] = useState<ListProductsSort>(ListProductsSort.newest);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [activeTab, setActiveTab] = useState("club");

  const { data: categories } = useListCategories();
  const { data: leagues } = useListLeagues();

  const jerseysCategoryId = categories?.find(c => c.slug === 'jerseys')?.id;
  
  const { data: products, isLoading } = useListProducts({
    categoryId: jerseysCategoryId,
    leagueId: selectedLeague,
    sort,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined
  });

  const clubLeagues = leagues?.filter(l => !l.isInternational) || [];
  const intlLeagues = leagues?.filter(l => l.isInternational) || [];

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center bg-black">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1518063319808-ce6e719ed025?q=80&w=2070&auto=format&fit=crop" alt="Jerseys" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4 shadow-black drop-shadow-lg">Jerseys of Your Favorite Team</h1>
          <p className="text-primary font-medium tracking-widest uppercase text-sm md:text-base drop-shadow-md">Wear your pride</p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <Tabs defaultValue="club" onValueChange={(v) => { setActiveTab(v); setSelectedLeague(undefined); }} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-background/80 backdrop-blur-md border shadow-lg">
              <TabsTrigger value="club" className="w-32 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Club Leagues</TabsTrigger>
              <TabsTrigger value="international" className="w-32 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">International</TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-card border rounded-xl p-4 mb-8 shadow-sm">
            <TabsContent value="club" className="m-0">
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                <button
                  onClick={() => setSelectedLeague(undefined)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${selectedLeague === undefined ? 'border-primary text-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                >
                  All Clubs
                </button>
                {clubLeagues.map(league => (
                  <button
                    key={league.id}
                    onClick={() => setSelectedLeague(league.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${selectedLeague === league.id ? 'border-primary text-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                  >
                    {league.logoUrl ? (
                      <img src={league.logoUrl} alt={league.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <Trophy className="w-4 h-4" />
                    )}
                    <span className="font-medium whitespace-nowrap">{league.name}</span>
                  </button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="international" className="m-0">
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                <button
                  onClick={() => setSelectedLeague(undefined)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${selectedLeague === undefined ? 'border-primary text-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                >
                  All Nations
                </button>
                {intlLeagues.map(league => (
                  <button
                    key={league.id}
                    onClick={() => setSelectedLeague(league.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${selectedLeague === league.id ? 'border-primary text-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                  >
                    {league.logoUrl ? (
                      <img src={league.logoUrl} alt={league.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <Trophy className="w-4 h-4" />
                    )}
                    <span className="font-medium whitespace-nowrap">{league.name}</span>
                  </button>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 bg-muted/20 rounded-lg">
          <div className="text-sm font-medium text-muted-foreground">
            {isLoading ? 'Loading...' : `Showing ${products?.length || 0} jerseys`}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                placeholder="Min ৳" 
                value={minPrice} 
                onChange={e => setMinPrice(e.target.value)}
                className="w-24 h-9"
              />
              <span className="text-muted-foreground">-</span>
              <Input 
                type="number" 
                placeholder="Max ৳" 
                value={maxPrice} 
                onChange={e => setMaxPrice(e.target.value)}
                className="w-24 h-9"
              />
            </div>
            
            <Select value={sort} onValueChange={(v) => setSort(v as ListProductsSort)}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ListProductsSort.newest}>Newest</SelectItem>
                <SelectItem value={ListProductsSort.price_asc}>Price: Low to High</SelectItem>
                <SelectItem value={ListProductsSort.price_desc}>Price: High to Low</SelectItem>
                <SelectItem value={ListProductsSort.popular}>Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard product={product} index={i} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-20 bg-muted/10 rounded-lg border border-dashed">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold mb-2">No jerseys found</h3>
              <p className="text-muted-foreground mb-6">We couldn't find any jerseys matching your criteria.</p>
              <Button onClick={() => {
                setSelectedLeague(undefined);
                setMinPrice("");
                setMaxPrice("");
              }}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}