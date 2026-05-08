import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetFeaturedProducts, useGetNewArrivals, useListOffers } from "@workspace/api-client-react";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowRight, Shield, Truck, CreditCard } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

export default function Home() {
  const { data: featuredProducts, isLoading: featuredLoading } = useGetFeaturedProducts();
  const { data: newArrivals, isLoading: arrivalsLoading } = useGetNewArrivals();
  const { data: offers } = useListOffers();

  const [heroRef, heroApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!heroApi) return;
    
    heroApi.on('select', () => {
      setCurrentSlide(heroApi.selectedScrollSnap());
    });
    
    const interval = setInterval(() => {
      heroApi.scrollNext();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroApi]);

  const heroSlides = [
    {
      title: "PREMIUM LOREX FABRIC",
      subtitle: "EXPERIENCE LUXURY ON THE PITCH",
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop",
      cta: "Shop Lorex Edition",
      link: "/products?fabric=lorex"
    },
    {
      title: "PLAYER EDITION",
      subtitle: "AUTHENTIC FIT. ULTIMATE PERFORMANCE.",
      image: "https://images.unsplash.com/photo-1518063319808-ce6e719ed025?q=80&w=2070&auto=format&fit=crop",
      cta: "Discover Player Editions",
      link: "/products?edition=player"
    },
    {
      title: "ROYAL CUSTOM",
      subtitle: "YOUR TEAM. YOUR COLORS. OUR CRAFT.",
      image: "https://images.unsplash.com/photo-1522778526114-f2a4bbcefb66?q=80&w=2065&auto=format&fit=crop",
      cta: "Bulk Orders",
      link: "/contact"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <section className="relative h-[85vh] md:h-[90vh] overflow-hidden bg-black" ref={heroRef}>
        <div className="flex h-full touch-pan-y">
          {heroSlides.map((slide, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
              <div className="absolute inset-0">
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 mt-16">
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-primary font-medium tracking-[0.2em] md:tracking-[0.3em] uppercase mb-4 text-sm md:text-base"
                >
                  {slide.subtitle}
                </motion.p>
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white uppercase tracking-tight mb-8"
                >
                  {slide.title}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={currentSlide === index ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base px-8 h-14 rounded-none">
                    <Link href={slide.link}>{slide.cta}</Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => heroApi?.scrollTo(index)}
              className={`h-1.5 transition-all duration-300 ${currentSlide === index ? "w-8 bg-primary" : "w-4 bg-white/50"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Offers Banner */}
      {offers && offers.length > 0 && (
        <section className="bg-accent text-accent-foreground py-3 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4 text-sm md:text-base font-medium">
              <span className="animate-pulse bg-black/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Flash Sale</span>
              <p>{offers[0].title} - {offers[0].description}</p>
              {offers[0].code && (
                <span className="font-mono bg-black/20 px-2 py-1 rounded">Code: {offers[0].code}</span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Editions Grid */}
      <section className="py-20 md:py-32 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Choose Your Edition</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Crafted with precision for every level of passion. From the stands to the pitch.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 'player', name: 'Player Edition', desc: 'Athletic fit, premium breathability', img: 'https://images.unsplash.com/photo-1600147184288-024d29f8f2b6?q=80&w=2070&auto=format&fit=crop' },
            { id: 'fan', name: 'Fan Edition', desc: 'Relaxed fit for everyday pride', img: 'https://images.unsplash.com/photo-1508344928928-7137b2f6b8b0?q=80&w=2070&auto=format&fit=crop' },
            { id: 'kid', name: 'Kid Edition', desc: 'Durable comfort for the next generation', img: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=2070&auto=format&fit=crop' },
            { id: 'premium', name: 'Premium Fabric', desc: 'Lorex & Leap Jacquard luxury', img: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1974&auto=format&fit=crop' }
          ].map((edition, i) => (
            <Link key={edition.id} href={`/products?edition=${edition.id}`}>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative aspect-[3/4] overflow-hidden rounded-lg cursor-pointer bg-black"
              >
                <img src={edition.img} alt={edition.name} className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                  <h3 className="font-serif text-2xl font-bold mb-2 group-hover:-translate-y-2 transition-transform duration-300">{edition.name}</h3>
                  <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 delay-100">{edition.desc}</p>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">Featured Drops</h2>
              <p className="text-muted-foreground">The most coveted gear this season.</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link href="/products">View All <ChevronRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
          
          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">No featured products available.</div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Fabric Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              The Royal Standard
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
              Fabric Engineered for <br/><span className="text-primary italic">Champions</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              We source only the highest grade materials. Box Mash for extreme durability, Lorex for that luxury sheen, and Leap Jacquard for unmatched breathability on the pitch.
            </p>
            
            <div className="space-y-4 pt-4">
              {[
                { name: 'Lorex', desc: 'Premium sheen, silky smooth against skin' },
                { name: 'Box Mash', desc: 'Textured durability for intense physical contact' },
                { name: 'Leap Jacquard', desc: 'Micro-perforated for maximum airflow' }
              ].map((fabric) => (
                <div key={fabric.name} className="flex gap-4 p-4 border rounded-lg bg-card hover:border-primary transition-colors">
                  <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">{fabric.name}</h4>
                    <p className="text-sm text-muted-foreground">{fabric.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-6">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8">Request Bulk Customization</Button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 h-[600px]"
          >
            <div className="space-y-4 pt-12">
              <img src="https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?q=80&w=1974&auto=format&fit=crop" alt="Fabric Detail" className="w-full h-64 object-cover rounded-lg" />
              <img src="https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?q=80&w=1998&auto=format&fit=crop" alt="Stitching Detail" className="w-full h-80 object-cover rounded-lg" />
            </div>
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1608248593842-b054238e4a9e?q=80&w=1974&auto=format&fit=crop" alt="Fabric Texture" className="w-full h-80 object-cover rounded-lg" />
              <img src="https://images.unsplash.com/photo-1544413660-299165566b1d?q=80&w=1974&auto=format&fit=crop" alt="Finished Product" className="w-full h-64 object-cover rounded-lg" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Premium Quality</h3>
              <p className="text-sm text-muted-foreground">Authentic materials imported globally</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Fast Nationwide Delivery</h3>
              <p className="text-sm text-muted-foreground">24-48 hours inside Dhaka, 3-5 days outside</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground">bKash, Nagad, Card & Cash on Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <h2 className="font-serif text-2xl font-bold mb-6">Royal Jersey <span className="text-primary">BD</span></h2>
              <p className="text-gray-400 text-sm mb-6">Premium luxury sports apparel crafted with Bangladeshi pride. Elevate your game with our exclusive editions.</p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer" />
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer" />
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer" />
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Shop</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="/products?category=jerseys" className="hover:text-primary transition-colors">Jerseys</Link></li>
                <li><Link href="/products?category=trousers" className="hover:text-primary transition-colors">Trousers</Link></li>
                <li><Link href="/products?category=balls" className="hover:text-primary transition-colors">Footballs</Link></li>
                <li><Link href="/products?collection=new" className="hover:text-primary transition-colors">New Arrivals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Support</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">Track Order</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Return Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Contact</h4>
              <ul className="space-y-4 text-gray-400">
                <li>House 12, Road 5, Block A</li>
                <li>Mirpur, Dhaka 1216</li>
                <li>support@royaljersey.bd</li>
                <li className="text-primary font-bold text-lg">+880 1234-567890</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Royal Jersey BD. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
