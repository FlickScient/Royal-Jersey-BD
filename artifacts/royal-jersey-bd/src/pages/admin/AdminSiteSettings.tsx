import { useState, useEffect } from "react";
import { useAdminGetSiteSettings, useAdminUpdateSiteSettings } from "@workspace/api-client-react";
import type { HeroSlide, FaqItem } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, Phone, Globe, ImageIcon, FileText, HelpCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAdminGetSiteSettingsQueryKey, getGetSiteSettingsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSiteSettings() {
  const { data: settings, isLoading } = useAdminGetSiteSettings();
  const updateSettings = useAdminUpdateSiteSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    store_name: "",
    store_tagline: "",
    whatsapp_number: "",
    phone_number: "",
    announcement_text: "",
    facebook_url: "",
    instagram_url: "",
    about_text: "",
    since_year: "",
  });

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [editionImages, setEditionImages] = useState({
    edition_player_image: "",
    edition_fan_image: "",
    edition_kid_image: "",
    edition_premium_image: "",
  });
  const [fabricImages, setFabricImages] = useState({
    fabric_image_1: "",
    fabric_image_2: "",
    fabric_image_3: "",
    fabric_image_4: "",
  });

  useEffect(() => {
    if (!settings) return;
    setForm({
      store_name: settings.store_name || "",
      store_tagline: settings.store_tagline || "",
      whatsapp_number: settings.whatsapp_number || "",
      phone_number: settings.phone_number || "",
      announcement_text: settings.announcement_text || "",
      facebook_url: settings.facebook_url || "",
      instagram_url: settings.instagram_url || "",
      about_text: settings.about_text || "",
      since_year: settings.since_year || "",
    });
    try {
      setHeroSlides(JSON.parse(settings.hero_slides || "[]"));
    } catch { setHeroSlides([]); }
    try {
      setFaqItems(JSON.parse(settings.faq_items || "[]"));
    } catch { setFaqItems([]); }
    setEditionImages({
      edition_player_image: settings.edition_player_image || "",
      edition_fan_image: settings.edition_fan_image || "",
      edition_kid_image: settings.edition_kid_image || "",
      edition_premium_image: settings.edition_premium_image || "",
    });
    setFabricImages({
      fabric_image_1: settings.fabric_image_1 || "",
      fabric_image_2: settings.fabric_image_2 || "",
      fabric_image_3: settings.fabric_image_3 || "",
      fabric_image_4: settings.fabric_image_4 || "",
    });
  }, [settings]);

  const handleSave = (section: Record<string, string>) => {
    updateSettings.mutate(
      { data: section },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminGetSiteSettingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSiteSettingsQueryKey() });
          toast({ title: "Settings saved", description: "Your changes are live on the site." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to save settings. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const addHeroSlide = () => {
    setHeroSlides(prev => [...prev, { title: "", subtitle: "", image: "", cta: "Shop Now", link: "/products" }]);
  };
  const removeHeroSlide = (i: number) => setHeroSlides(prev => prev.filter((_, idx) => idx !== i));
  const updateHeroSlide = (i: number, field: keyof HeroSlide, value: string) => {
    setHeroSlides(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const addFaqItem = () => setFaqItems(prev => [...prev, { question: "", answer: "" }]);
  const removeFaqItem = (i: number) => setFaqItems(prev => prev.filter((_, idx) => idx !== i));
  const updateFaqItem = (i: number, field: keyof FaqItem, value: string) => {
    setFaqItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">Site Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Customize your entire website without touching code.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-[#111] border border-border/10">
          <TabsTrigger value="general"><Globe className="w-3 h-3 mr-1.5" />General</TabsTrigger>
          <TabsTrigger value="contact"><Phone className="w-3 h-3 mr-1.5" />Contact</TabsTrigger>
          <TabsTrigger value="hero"><ImageIcon className="w-3 h-3 mr-1.5" />Hero Slides</TabsTrigger>
          <TabsTrigger value="images"><ImageIcon className="w-3 h-3 mr-1.5" />Images</TabsTrigger>
          <TabsTrigger value="content"><FileText className="w-3 h-3 mr-1.5" />Content</TabsTrigger>
          <TabsTrigger value="faq"><HelpCircle className="w-3 h-3 mr-1.5" />FAQ</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-6">
          <Card className="bg-[#111] border-border/10">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Store name, tagline, and announcement bar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input value={form.store_name} onChange={e => setForm(p => ({ ...p, store_name: e.target.value }))} className="bg-background border-border/20" placeholder="Royal Jersey BD" />
                </div>
                <div className="space-y-2">
                  <Label>Since Year</Label>
                  <Input value={form.since_year} onChange={e => setForm(p => ({ ...p, since_year: e.target.value }))} className="bg-background border-border/20" placeholder="2020" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Store Tagline</Label>
                  <Input value={form.store_tagline} onChange={e => setForm(p => ({ ...p, store_tagline: e.target.value }))} className="bg-background border-border/20" placeholder="Premium luxury sports apparel..." />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Announcement Bar Text</Label>
                  <Input value={form.announcement_text} onChange={e => setForm(p => ({ ...p, announcement_text: e.target.value }))} className="bg-background border-border/20" placeholder="Free delivery on orders above ৳2,000" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => handleSave({ store_name: form.store_name, store_tagline: form.store_tagline, announcement_text: form.announcement_text, since_year: form.since_year })} disabled={updateSettings.isPending}>
                  <Save className="w-4 h-4 mr-2" />{updateSettings.isPending ? "Saving..." : "Save General Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact" className="mt-6">
          <Card className="bg-[#111] border-border/10">
            <CardHeader>
              <CardTitle>Contact & Social</CardTitle>
              <CardDescription>WhatsApp, phone, and social media links used across the site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input value={form.whatsapp_number} onChange={e => setForm(p => ({ ...p, whatsapp_number: e.target.value }))} className="bg-background border-border/20" placeholder="+8801234567890" />
                  <p className="text-xs text-muted-foreground">Used for WhatsApp button. Include country code, no spaces.</p>
                </div>
                <div className="space-y-2">
                  <Label>Support Phone Number</Label>
                  <Input value={form.phone_number} onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))} className="bg-background border-border/20" placeholder="+880 1234-567890" />
                  <p className="text-xs text-muted-foreground">Displayed in header and announcement bar.</p>
                </div>
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input value={form.facebook_url} onChange={e => setForm(p => ({ ...p, facebook_url: e.target.value }))} className="bg-background border-border/20" placeholder="https://facebook.com/yourpage" />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input value={form.instagram_url} onChange={e => setForm(p => ({ ...p, instagram_url: e.target.value }))} className="bg-background border-border/20" placeholder="https://instagram.com/yourpage" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => handleSave({ whatsapp_number: form.whatsapp_number, phone_number: form.phone_number, facebook_url: form.facebook_url, instagram_url: form.instagram_url })} disabled={updateSettings.isPending}>
                  <Save className="w-4 h-4 mr-2" />{updateSettings.isPending ? "Saving..." : "Save Contact Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Slides */}
        <TabsContent value="hero" className="mt-6">
          <Card className="bg-[#111] border-border/10">
            <CardHeader>
              <CardTitle>Hero Banner Slides</CardTitle>
              <CardDescription>The rotating banner on the homepage. Each slide has a title, subtitle, image, and button.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {heroSlides.map((slide, i) => (
                <div key={i} className="p-4 border border-border/20 rounded-lg space-y-3 bg-background/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Slide {i + 1}</span>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 h-7 w-7" onClick={() => removeHeroSlide(i)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Title</Label>
                      <Input value={slide.title} onChange={e => updateHeroSlide(i, "title", e.target.value)} className="bg-background border-border/20 h-9" placeholder="PLAYER EDITION" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Subtitle</Label>
                      <Input value={slide.subtitle} onChange={e => updateHeroSlide(i, "subtitle", e.target.value)} className="bg-background border-border/20 h-9" placeholder="AUTHENTIC FIT. ULTIMATE PERFORMANCE." />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label className="text-xs">Background Image URL</Label>
                      <Input value={slide.image} onChange={e => updateHeroSlide(i, "image", e.target.value)} className="bg-background border-border/20 h-9" placeholder="https://images.unsplash.com/..." />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Button Text</Label>
                      <Input value={slide.cta} onChange={e => updateHeroSlide(i, "cta", e.target.value)} className="bg-background border-border/20 h-9" placeholder="Shop Now" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Button Link</Label>
                      <Input value={slide.link} onChange={e => updateHeroSlide(i, "link", e.target.value)} className="bg-background border-border/20 h-9" placeholder="/products" />
                    </div>
                  </div>
                  {slide.image && (
                    <div className="h-24 rounded overflow-hidden bg-muted">
                      <img src={slide.image} alt="Preview" className="w-full h-full object-cover opacity-70" />
                    </div>
                  )}
                </div>
              ))}
              <Button variant="outline" className="w-full border-dashed border-border/30 hover:border-primary/50" onClick={addHeroSlide}>
                <Plus className="w-4 h-4 mr-2" /> Add Slide
              </Button>
              <div className="flex justify-end pt-2">
                <Button onClick={() => handleSave({ hero_slides: JSON.stringify(heroSlides) })} disabled={updateSettings.isPending}>
                  <Save className="w-4 h-4 mr-2" />{updateSettings.isPending ? "Saving..." : "Save Hero Slides"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images */}
        <TabsContent value="images" className="mt-6 space-y-6">
          <Card className="bg-[#111] border-border/10">
            <CardHeader>
              <CardTitle>Edition Images</CardTitle>
              <CardDescription>Images for the "Choose Your Edition" section on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "edition_player_image", label: "Player Edition Image" },
                  { key: "edition_fan_image", label: "Fan Edition Image" },
                  { key: "edition_kid_image", label: "Kid Edition Image" },
                  { key: "edition_premium_image", label: "Premium Fabric Image" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      value={editionImages[key as keyof typeof editionImages]}
                      onChange={e => setEditionImages(p => ({ ...p, [key]: e.target.value }))}
                      className="bg-background border-border/20"
                      placeholder="https://..."
                    />
                    {editionImages[key as keyof typeof editionImages] && (
                      <div className="h-24 rounded overflow-hidden bg-muted">
                        <img src={editionImages[key as keyof typeof editionImages]} alt={label} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => handleSave(editionImages)} disabled={updateSettings.isPending}>
                  <Save className="w-4 h-4 mr-2" />{updateSettings.isPending ? "Saving..." : "Save Edition Images"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-border/10">
            <CardHeader>
              <CardTitle>Fabric Section Images</CardTitle>
              <CardDescription>The 4 images in the "Fabric Engineered for Champions" section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => {
                  const key = `fabric_image_${n}` as keyof typeof fabricImages;
                  return (
                    <div key={n} className="space-y-2">
                      <Label>Fabric Image {n}</Label>
                      <Input
                        value={fabricImages[key]}
                        onChange={e => setFabricImages(p => ({ ...p, [key]: e.target.value }))}
                        className="bg-background border-border/20"
                        placeholder="https://..."
                      />
                      {fabricImages[key] && (
                        <div className="h-24 rounded overflow-hidden bg-muted">
                          <img src={fabricImages[key]} alt={`Fabric ${n}`} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => handleSave(fabricImages)} disabled={updateSettings.isPending}>
                  <Save className="w-4 h-4 mr-2" />{updateSettings.isPending ? "Saving..." : "Save Fabric Images"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content */}
        <TabsContent value="content" className="mt-6">
          <Card className="bg-[#111] border-border/10">
            <CardHeader>
              <CardTitle>About Us Text</CardTitle>
              <CardDescription>The brand story shown on the homepage and About page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={form.about_text}
                onChange={e => setForm(p => ({ ...p, about_text: e.target.value }))}
                className="bg-background border-border/20 min-h-[180px]"
                placeholder="Tell your brand story..."
              />
              <div className="flex justify-end">
                <Button onClick={() => handleSave({ about_text: form.about_text })} disabled={updateSettings.isPending}>
                  <Save className="w-4 h-4 mr-2" />{updateSettings.isPending ? "Saving..." : "Save About Text"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="mt-6">
          <Card className="bg-[#111] border-border/10">
            <CardHeader>
              <CardTitle>FAQ Items</CardTitle>
              <CardDescription>Frequently Asked Questions shown on the FAQ page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map((item, i) => (
                <div key={i} className="p-4 border border-border/20 rounded-lg space-y-3 bg-background/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Question {i + 1}</span>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 h-7 w-7" onClick={() => removeFaqItem(i)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Question</Label>
                    <Input value={item.question} onChange={e => updateFaqItem(i, "question", e.target.value)} className="bg-background border-border/20" placeholder="What fabric types do you offer?" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Answer</Label>
                    <Textarea value={item.answer} onChange={e => updateFaqItem(i, "answer", e.target.value)} className="bg-background border-border/20 min-h-[80px]" placeholder="We offer..." />
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-dashed border-border/30 hover:border-primary/50" onClick={addFaqItem}>
                <Plus className="w-4 h-4 mr-2" /> Add FAQ Item
              </Button>
              <div className="flex justify-end pt-2">
                <Button onClick={() => handleSave({ faq_items: JSON.stringify(faqItems) })} disabled={updateSettings.isPending}>
                  <Save className="w-4 h-4 mr-2" />{updateSettings.isPending ? "Saving..." : "Save FAQ"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
