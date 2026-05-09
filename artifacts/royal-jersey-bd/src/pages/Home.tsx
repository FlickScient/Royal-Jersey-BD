import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetFeaturedProducts, useGetNewArrivals, useListOffers } from "@workspace/api-client-react";
import ProductCard from "@/components/products/ProductCard";
import WorldCupBanner from "@/components/layout/WorldCupBanner";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowRight, Shield, Truck, CreditCard, Star, Users, Award, Package, Facebook, Instagram, MessageCircle } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

export default function Home() {
  const { data: featuredProducts, isLoading: featuredLoading } = useGetFeaturedProducts();
  const { data: newArrivals, isLoading: arrivalsLoading } = useGetNewArrivals();
  const { data: offers } = useListOffers();

  const [heroRef, heroApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!heroApi) return;
    heroApi.on('select', () => setCurrentSlide(heroApi.selectedScrollSnap()));
    const interval = setInterval(() => heroApi.scrollNext(), 5000);
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
      {/* Announcement Bar */}
      <div className="bg-[#1a2744] text-white text-xs py-2 text-center px-4 z-50">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span>🚚 Free delivery on orders above ৳2,000</span>
          <span className="hidden sm:inline">|</span>
          <span>📞 Helpline: +880 1234-567890</span>
          <span className="hidden sm:inline">|</span>
          <Link href="/track-order" className="underline hover:text-primary transition-colors">Track Your Order →</Link>
        </div>
      </div>

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

      {/* World Cup 2026 Exclusive Banner */}
      <WorldCupBanner />

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

      {/* Why Choose Us */}
      <section className="py-24 bg-[#1a2744] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-4 border border-primary/20">
              Why Royal Jersey BD
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">The Royal Difference</h2>
            <p className="text-gray-400 max-w-xl mx-auto">We're not just another jersey shop. Here's what makes us Bangladesh's most trusted sports apparel brand.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Premium Fabrics Only", desc: "Lorex, Box Mash, and Leap Jacquard — every jersey is made from authenticated, imported materials tested for durability and feel." },
              { icon: Truck, title: "Nationwide Delivery", desc: "Inside Dhaka in 24-48 hours. All 64 districts covered in 3-5 days. We partner with Pathao, Redx, and SA Paribahan." },
              { icon: Users, title: "Bulk & Custom Orders", desc: "Team jerseys, school uniforms, corporate kits — we handle large orders with custom names, numbers, and logos." },
              { icon: Award, title: "Authentic Editions", desc: "Player Edition, Fan Edition, and Premium Lorex — each jersey clearly labelled so you know exactly what you're getting." },
              { icon: CreditCard, title: "bKash · Nagad · COD", desc: "Pay the way you prefer. Cash on Delivery available everywhere. Online payment via bKash, Nagad, card." },
              { icon: Star, title: "7-Day Easy Returns", desc: "Wrong size? Defective product? We make returns easy. No questions asked within 7 days of delivery." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/10 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals && newArrivals.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">New Arrivals</h2>
                <p className="text-muted-foreground">Fresh drops just landed.</p>
              </div>
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link href="/products?collection=new">View All <ChevronRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
            {arrivalsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newArrivals.slice(0, 4).map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

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
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8" asChild>
                <Link href="/contact">Request Bulk Customization</Link>
              </Button>
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

      {/* Brand Story */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative">
                <img
                  src="/logo-img.jpg"
                  alt="Royal Jersey BD"
                  className="w-64 h-64 rounded-2xl object-cover shadow-2xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm">
                  Since 2020
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-5"
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider">
                Our Story
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
                Born in Bangladesh,<br />
                <span className="text-primary">Built for Champions</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Royal Jersey BD was born from a passion for football and frustration with low-quality, overpriced jerseys. We set out to build something different — premium quality, honest pricing, and a brand Bangladeshis can be proud of.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From a small Facebook page to a full-fledged e-commerce store, thousands of fans and athletes across Bangladesh now trust us for their sportswear. Every jersey we sell carries our commitment to quality and your pride.
              </p>
              <div className="flex gap-6 pt-2">
                {[
                  { value: "5000+", label: "Customers" },
                  { value: "64", label: "Districts" },
                  { value: "4.9★", label: "Rating" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-serif font-bold text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">Read Our Full Story</Link>
              </Button>
            </motion.div>
          </div>
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
      <footer className="bg-[#0d1525] text-white pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo-img.jpg" alt="Royal Jersey BD" className="w-12 h-12 rounded-lg object-cover" />
                <h2 className="font-serif text-xl font-bold">Royal Jersey <span className="text-primary">BD</span></h2>
              </div>
              <p className="text-gray-400 text-sm mb-6">Premium luxury sports apparel crafted with Bangladeshi pride. Elevate your game with our exclusive editions.</p>
              <div className="flex gap-3 mb-6">
                <a href="https://facebook.com/royaljersey.bd" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#1877F2]/20 flex items-center justify-center hover:bg-[#1877F2] transition-colors text-[#1877F2] hover:text-white">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/royaljersey.bd" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center hover:bg-pink-500 transition-colors text-pink-400 hover:text-white">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://wa.me/+8801234567890" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center hover:bg-[#25D366] transition-colors text-[#25D366] hover:text-white">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
              {/* Payment Badges */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">We Accept</p>
                <div className="flex flex-wrap gap-2">
                  {["bKash", "Nagad", "COD", "Visa", "MasterCard"].map(method => (
                    <span key={method} className="px-2.5 py-1 text-xs font-bold rounded-md bg-white/10 text-gray-300 border border-white/10">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Shop</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="/products?category=jerseys" className="hover:text-primary transition-colors">Jerseys</Link></li>
                <li><Link href="/products?category=trousers" className="hover:text-primary transition-colors">Trousers</Link></li>
                <li><Link href="/products?category=balls" className="hover:text-primary transition-colors">Footballs</Link></li>
                <li><Link href="/products?collection=new" className="hover:text-primary transition-colors">New Arrivals</Link></li>
                <li><Link href="/products?collection=offers" className="hover:text-primary transition-colors">Offers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Help</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="/track-order" className="hover:text-primary transition-colors">Track Order</Link></li>
                <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Contact</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <Package className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  House 12, Road 5, Block A, Mirpur, Dhaka 1216
                </li>
                <li>
                  <a href="mailto:support@royaljersey.bd" className="hover:text-primary transition-colors">support@royaljersey.bd</a>
                </li>
                <li>
                  <a href="https://wa.me/+8801234567890" className="text-primary font-bold text-base hover:text-primary/80 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    +880 1234-567890
                  </a>
                </li>
                <li className="pt-2 text-xs">
                  <p className="font-semibold text-gray-300 mb-1">Delivery Policy</p>
                  <p>Inside Dhaka: ৳70 · 24-48 hrs</p>
                  <p>Outside Dhaka: ৳120 · 3-5 days</p>
                  <p className="text-primary">Free above ৳2,000</p>
                </li>
              </ul>
            </div>
          </div>
          {/* Return Policy Strip */}
          <div className="border-t border-white/10 pt-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs text-gray-500">
              <div className="flex flex-col items-center gap-1">
                <span className="text-primary font-bold">7 Days</span>
                <span>Easy Returns</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-primary font-bold">100%</span>
                <span>Original Products</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-primary font-bold">COD</span>
                <span>Cash on Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-primary font-bold">24/7</span>
                <span>WhatsApp Support</span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Royal Jersey BD. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/faq" className="hover:text-white">FAQ</Link>
              <Link href="/about" className="hover:text-white">About Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
