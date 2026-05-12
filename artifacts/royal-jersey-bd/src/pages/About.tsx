import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Truck, Users, Award, Heart, Star } from "lucide-react";
import { useGetSiteSettings } from "@workspace/api-client-react";

export default function About() {
  const { data: siteSettings } = useGetSiteSettings();
  const customerCount = (siteSettings as any)?.customer_count || "5,000+";
  const districtCount = (siteSettings as any)?.district_count || "64";

  return (
    <div className="min-h-screen pt-20">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link> / <span className="text-foreground">About Us</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-[#1a2744] to-[#0e1828] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-semibold uppercase tracking-wider mb-6 border border-primary/30">
              Our Story
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
              Born in Bangladesh.<br />
              <span className="text-primary">Built for Champions.</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Royal Jersey BD was founded with a single vision — to bring world-class sports apparel to Bangladeshi fans and athletes at honest prices, with uncompromising quality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold">How It All Started</h2>
            <p className="text-muted-foreground leading-relaxed">
              It started with a frustration. Finding authentic, high-quality sports jerseys in Bangladesh was either too expensive or too unreliable. Cheap fakes flooded the market, while genuine products were priced out of reach for most fans.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Royal Jersey BD was born to solve that problem. We built direct relationships with premium fabric suppliers, cut out the middlemen, and focused obsessively on quality control — so that every jersey that leaves our hands is one we're proud of.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, we serve thousands of football fans, school teams, corporate groups, and individual athletes across Bangladesh. From Dhaka to Chittagong, our jerseys are worn with pride.
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link href="/products">Shop Our Collection</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-4 pt-8">
              <img src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop" alt="Team" className="w-full h-48 object-cover rounded-lg" />
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop" alt="Quality" className="w-full h-64 object-cover rounded-lg" />
            </div>
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=800&auto=format&fit=crop" alt="Fabric" className="w-full h-64 object-cover rounded-lg" />
              <img src="https://images.unsplash.com/photo-1522778526114-f2a4bbcefb66?q=80&w=800&auto=format&fit=crop" alt="Product" className="w-full h-48 object-cover rounded-lg" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#1a2744] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: customerCount, label: "Happy Customers" },
              { value: "200+", label: "Products" },
              { value: districtCount, label: "Districts Delivered" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-serif font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Why We Do What We Do</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Every decision we make is guided by these core principles.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: "Uncompromising Quality", desc: "We test every fabric, every stitch. If it's not good enough for us, it doesn't reach you." },
            { icon: Heart, title: "Customer First", desc: "Your satisfaction is our success. We offer hassle-free returns and always pick up the phone." },
            { icon: Truck, title: "Fast & Reliable Delivery", desc: "24-48 hours inside Dhaka, 3-5 days outside. We respect your time." },
            { icon: Users, title: "Built for Everyone", desc: "From school teams to professional clubs, we serve every level of the game." },
            { icon: Award, title: "Authentic Materials", desc: "Lorex, Box Mash, Leap Jacquard — only premium, sourced-with-care fabrics." },
            { icon: Star, title: "Bangladesh Proud", desc: "We're 100% Bangladeshi-run, supporting local businesses and the local economy." },
          ].map((val, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 border rounded-lg bg-card hover:border-primary transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <val.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{val.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold mb-4">Ready to Join the Royal Family?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Thousands of satisfied customers can't be wrong. Experience the Royal Jersey BD difference today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
