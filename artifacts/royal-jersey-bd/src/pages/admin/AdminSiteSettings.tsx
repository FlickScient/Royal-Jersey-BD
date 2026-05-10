import { useState, useEffect } from "react";
import { useAdminGetSiteSettings, useAdminUpdateSiteSettings } from "@workspace/api-client-react";
import type { HeroSlide, FaqItem } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, Phone, Globe, ImageIcon, FileText, HelpCircle, LayoutTemplate, ArrowUp, ArrowDown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAdminGetSiteSettingsQueryKey, getGetSiteSettingsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import ImageUploadWidget from "@/components/admin/ImageUploadWidget";

const SECTIONS = [
  { key: "hero", label: "Hero Slider", description: "Full-screen rotating banner at the top" },
  { key: "offers", label: "Offers Banner", description: "Flash sale / discount code strip" },
  { key: "worldcup", label: "World Cup 2026 Banner", description: "Seasonal promotional banner" },
  { key: "editions", label: "Choose Your Edition", description: "Player / Fan / Kid / Premium grid" },
  { key: "featured", label: "Featured Drops", description: "Hand-picked featured products" },
  { key: "whyus", label: "Why Choose Us", description: "6-point trust section (dark background)" },
  { key: "arrivals", label: "New Arrivals", description: "Latest products added to the store" },
  { key: "leagues", label: "Shop by League", description: "League logo grid linking to jersey filters" },
  { key: "fabric", label: "Fabric Section", description: "Lorex / Box Mash / Leap Jacquard details" },
  { key: "brandstory", label: "Brand Story", description: "About us section with logo and stats" },
  { key: "trustbadges", label: "Trust Badges", description: "Quality / Delivery / Secure checkout icons" },
];

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
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTIONS.map(s => [s.key, true]))
  );

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
    try { setHeroSlides(JSON.parse(settings.hero_slides || "[]")); } catch { setHeroSlides([]); }
    try { setFaqItems(JSON.parse(settings.faq_items || "[]")); } catch { setFaqItems([]); }
    try {
      const vis = JSON.parse(settings.section_visibility || "{}");
      setSectionVisibility(prev => ({ ...prev, ...vis }));
    } catch { /* use defaults */ }
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
  const moveHeroSlide = (from: number, to: number) => {
    if (to < 0 || to >= heroSlides.length) return;
    setHeroSlides(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const addFaqItem = () => setFaqItems(prev => [...prev, { question: "", answer: "" }]);
  const removeFaqItem = (i: number) => setFaqItems(prev => prev.filter((_, idx) => idx !== i));
  const updateFaqItem = (i: number, field: keyof FaqItem, value: string) => {
    setFaqItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const toggleSection = (key: string) => {
    setSectionVisibility(prev => ({ ...prev, [key]: !prev[key] }));
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
        <h2 className="text-2xl font-serif font-bold text-white">Site Settings</h2>
        <p className="text-gray-400 text-sm mt-1">Customize your entire website without touching code.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-[#111] border border-white/10 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="general" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
            <Globe className="w-3 h-3 mr-1.5" />General
          </TabsTrigger>
          <TabsTrigger value="contact" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
            <Phone className="w-3 h-3 mr-1.5" />Contact
          </TabsTrigger>
          <TabsTrigger value="hero" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
            <ImageIcon className="w-3 h-3 mr-1.5" />Hero Slides
          </TabsTrigger>
          <TabsTrigger value="images" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
            <ImageIcon className="w-3 h-3 mr-1.5" />Images
          </TabsTrigger>
          <TabsTrigger value="content" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
            <FileText className="w-3 h-3 mr-1.5" />Content
          </TabsTrigger>
          <TabsTrigger value="sections" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
            <LayoutTemplate className="w-3 h-3 mr-1.5" />Sections
          </TabsTrigger>
          <TabsTrigger value="faq" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-white/10">
            <HelpCircle className="w-3 h-3 mr-1.5" />FAQ
          </TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-6">
          <Card className="bg-[#111] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">General Settings</CardTitle>
              <CardDescription className="text-gray-400">Store name, tagline, and announcement bar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Store Name</Label>
                  <Input value={form.store_name} onChange={e => setForm(p => ({ ...p, store_name: e.target.value }))} className="bg-background border-white/10 text-white placeholder:text-gray-500" placeholder="Royal Jersey BD" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Since Year</Label>
                  <Input value={form.since_year} onChange={e => setForm(p => ({ ...p, since_year: e.target.value }))} className="bg-background border-white/10 text-white placeholder:text-gray-500" placeholder="2020" />
                </div>
                <div className="space-y-2 col-span-full">
                  <Label className="text-gray-300">Store Tagline</Label>
                  <Input value={form.store_tagline} onChange={e => setForm(p => ({ ...p, store_tagline: e.target.value }))} className="bg-background border-white/10 text-white placeholder:text-gray-500" placeholder="Premium luxury sports apparel..." />
                </div>
                <div className="space-y-2 col-span-full">
                  <Label className="text-gray-300">Announcement Bar Text</Label>
                  <Input value={form.announcement_text} onChange={e => setForm(p => ({ ...p, announcement_text: e.target.value }))} className="bg-background border-white/10 text-white placeholder:text-gray-500" placeholder="Free delivery on orders above ৳2,000" />
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
          <Card className="bg-[#111] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Contact & Social</CardTitle>
              <CardDescription className="text-gray-400">WhatsApp, phone, and social media links used across the site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">WhatsApp Number</Label>
                  <Input value={form.whatsapp_number} onChange={e => setForm(p => ({ ...p, whatsapp_number: e.target.value }))} className="bg-background border-white/10 text-white placeholder:text-gray-500" placeholder="+8801234567890" />
                  <p className="text-xs text-gray-500">Include country code, no spaces.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Support Phone Number</Label>
                  <Input value={form.phone_number} onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))} className="bg-background border-white/10 text-white placeholder:text-gray-500" placeholder="+880 1234-567890" />
                  <p className="text-xs text-gray-500">Displayed in header and announcement bar.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Facebook URL</Label>
                  <Input value={form.facebook_url} onChange={e => setForm(p => ({ ...p, facebook_url: e.target.value }))} className="bg-background border-white/10 text-white placeholder:text-gray-500" placeholder="https://facebook.com/yourpage" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Instagram URL</Label>
                  <Input value={form.instagram_url} onChange={e => setForm(p => ({ ...p, instagram_url: e.target.value }))} className="bg-background border-white/10 text-white placeholder:text-gray-500" placeholder="https://instagram.com/yourpage" />
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
          <Card className="bg-[#111] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Hero Banner Slides</CardTitle>
              <CardDescription className="text-gray-400">The rotating banner on the homepage. Each slide has a title, subtitle, image, and button.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {heroSlides.map((slide, i) => (
                <div key={i} className="p-4 border border-white/10 rounded-lg space-y-3 bg-background/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Slide {i + 1} of {heroSlides.length}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20"
                        disabled={i === 0}
                        onClick={() => moveHeroSlide(i, i - 1)}
                        title="Move slide up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20"
                        disabled={i === heroSlides.length - 1}
                        onClick={() => moveHeroSlide(i, i + 1)}
                        title="Move slide down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10 h-7 w-7 ml-1" onClick={() => removeHeroSlide(i)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-300">Title</Label>
                      <Input value={slide.title} onChange={e => updateHeroSlide(i, "title", e.target.value)} className="bg-background border-white/10 text-white h-9" placeholder="PLAYER EDITION" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-300">Subtitle</Label>
                      <Input value={slide.subtitle} onChange={e => updateHeroSlide(i, "subtitle", e.target.value)} className="bg-background border-white/10 text-white h-9" placeholder="AUTHENTIC FIT. ULTIMATE PERFORMANCE." />
                    </div>
                    <div className="col-span-full">
                      <ImageUploadWidget
                        label="Background Image"
                        value={slide.image}
                        onChange={url => updateHeroSlide(i, "image", url)}
                        height="h-28"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-300">Button Text</Label>
                      <Input value={slide.cta} onChange={e => updateHeroSlide(i, "cta", e.target.value)} className="bg-background border-white/10 text-white h-9" placeholder="Shop Now" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-300">Button Link</Label>
                      <Input value={slide.link} onChange={e => updateHeroSlide(i, "link", e.target.value)} className="bg-background border-white/10 text-white h-9" placeholder="/products" />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-dashed border-white/20 text-gray-300 hover:border-primary/50 hover:text-white" onClick={addHeroSlide}>
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
          <Card className="bg-[#111] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Edition Images</CardTitle>
              <CardDescription className="text-gray-400">Images for the "Choose Your Edition" section on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "edition_player_image", label: "Player Edition Image" },
                  { key: "edition_fan_image", label: "Fan Edition Image" },
                  { key: "edition_kid_image", label: "Kid Edition Image" },
                  { key: "edition_premium_image", label: "Premium Fabric Image" },
                ].map(({ key, label }) => (
                  <ImageUploadWidget
                    key={key}
                    label={label}
                    value={editionImages[key as keyof typeof editionImages]}
                    onChange={url => setEditionImages(p => ({ ...p, [key]: url }))}
                    height="h-28"
                  />
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => handleSave(editionImages)} disabled={updateSettings.isPending}>
                  <Save className="w-4 h-4 mr-2" />{updateSettings.isPending ? "Saving..." : "Save Edition Images"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Fabric Section Images</CardTitle>
              <CardDescription className="text-gray-400">The 4 images in the "Fabric Engineered for Champions" section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => {
                  const key = `fabric_image_${n}` as keyof typeof fabricImages;
                  return (
                    <ImageUploadWidget
                      key={n}
                      label={`Fabric Image ${n}`}
                      value={fabricImages[key]}
                      onChange={url => setFabricImages(p => ({ ...p, [key]: url }))}
                      height="h-28"
                    />
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
          <Card className="bg-[#111] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">About Us Text</CardTitle>
              <CardDescription className="text-gray-400">The brand story shown on the homepage and About page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={form.about_text}
                onChange={e => setForm(p => ({ ...p, about_text: e.target.value }))}
                className="bg-background border-white/10 text-white min-h-[180px] placeholder:text-gray-500"
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

        {/* Sections Visibility */}
        <TabsContent value="sections" className="mt-6">
          <Card className="bg-[#111] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Homepage Section Visibility</CardTitle>
              <CardDescription className="text-gray-400">
                Toggle which sections appear on the homepage. Hidden sections are instantly removed for visitors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SECTIONS.map(({ key, label, description }) => {
                const enabled = sectionVisibility[key] !== false;
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      enabled ? "border-white/10 bg-background/20" : "border-white/5 bg-background/10 opacity-60"
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className={`text-sm font-semibold ${enabled ? "text-white" : "text-gray-500"}`}>{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                    </div>
                    <button
                      onClick={() => toggleSection(key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                        enabled ? "bg-primary" : "bg-white/10"
                      }`}
                      role="switch"
                      aria-checked={enabled}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        enabled ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                );
              })}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500">
                  {Object.values(sectionVisibility).filter(Boolean).length} of {SECTIONS.length} sections visible
                </p>
                <Button onClick={() => handleSave({ section_visibility: JSON.stringify(sectionVisibility) })} disabled={updateSettings.isPending}>
                  <Save className="w-4 h-4 mr-2" />{updateSettings.isPending ? "Saving..." : "Save Section Visibility"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="mt-6">
          <Card className="bg-[#111] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">FAQ Items</CardTitle>
              <CardDescription className="text-gray-400">Frequently Asked Questions shown on the FAQ page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map((item, i) => (
                <div key={i} className="p-4 border border-white/10 rounded-lg space-y-3 bg-background/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Question {i + 1}</span>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10 h-7 w-7" onClick={() => removeFaqItem(i)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-300">Question</Label>
                    <Input value={item.question} onChange={e => updateFaqItem(i, "question", e.target.value)} className="bg-background border-white/10 text-white" placeholder="What fabric types do you offer?" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-300">Answer</Label>
                    <Textarea value={item.answer} onChange={e => updateFaqItem(i, "answer", e.target.value)} className="bg-background border-white/10 text-white min-h-[80px]" placeholder="We offer..." />
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-dashed border-white/20 text-gray-300 hover:border-primary/50 hover:text-white" onClick={addFaqItem}>
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
