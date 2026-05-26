import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, MessageCircle, Facebook, Instagram } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `*New Message from Royal Jersey BD Website*\n\n*Name:* ${form.name}\n*Phone:* ${form.phone}\n*Email:* ${form.email}\n*Subject:* ${form.subject}\n\n*Message:*\n${form.message}`
    );
    window.open(`https://wa.me/+8801867751573?text=${text}`, "_blank");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link> / <span className="text-foreground">Contact</span>
        </div>
      </div>

      {/* Header */}
      <section className="py-16 text-center container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Get in Touch</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">We're here to help. Reach out via WhatsApp for the fastest response, or use the form below.</p>
        </motion.div>
      </section>

      <div className="container mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/+8801867751573"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg">WhatsApp (Fastest)</p>
                <p className="text-muted-foreground text-sm">Tap to chat — we usually reply in minutes</p>
                <p className="text-[#25D366] font-semibold mt-1">+8801867751573</p>
              </div>
            </a>

            <div className="space-y-5">
              {[
                { icon: Phone, label: "Phone", value: "+8801867751573", href: "tel:+8801867751573" },
                { icon: Mail, label: "Email", value: "support@royaljersey.bd", href: "mailto:support@royaljersey.bd" },
                { icon: MapPin, label: "Address", value: "House 12, Road 5, Block A, Mirpur, Dhaka 1216" },
                { icon: Clock, label: "Hours", value: "Sat–Thu: 9am–9pm | Friday: 2pm–9pm" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="font-medium hover:text-primary transition-colors">{item.value}</a>
                    ) : (
                      <p className="font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div>
              <p className="font-bold mb-4">Follow Us</p>
              <div className="flex gap-3">
                <a href="https://facebook.com/royaljersey.bd" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1877F2]/10 border border-[#1877F2]/20 hover:bg-[#1877F2]/20 transition-colors text-[#1877F2]">
                  <Facebook className="w-5 h-5" />
                  <span className="text-sm font-medium">Facebook</span>
                </a>
                <a href="https://instagram.com/royaljersey.bd" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-colors text-pink-500">
                  <Instagram className="w-5 h-5" />
                  <span className="text-sm font-medium">Instagram</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="p-8 rounded-xl border bg-card">
              <h2 className="text-2xl font-serif font-bold mb-6">Send a Message</h2>
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Message Sent via WhatsApp!</h3>
                  <p className="text-muted-foreground">We'll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Your Name</Label>
                      <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Rahim Uddin" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone Number</Label>
                      <Input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email (Optional)</Label>
                    <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Subject</Label>
                    <Input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Order inquiry, bulk order, etc." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Message</Label>
                    <Textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us how we can help..." />
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send via WhatsApp
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">This will open WhatsApp with your message pre-filled.</p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
