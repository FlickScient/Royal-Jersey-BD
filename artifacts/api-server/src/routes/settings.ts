import { Router } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db";

const router = Router();

const DEFAULT_SETTINGS: Record<string, string> = {
  whatsapp_number: "+8801234567890",
  phone_number: "+880 1234-567890",
  announcement_text: "Free delivery on orders above ৳2,000",
  free_delivery_threshold: "2000",
  store_name: "Royal Jersey BD",
  store_tagline: "Premium luxury sports apparel crafted with Bangladeshi pride.",
  since_year: "2020",
  facebook_url: "https://facebook.com/royaljersey.bd",
  instagram_url: "https://instagram.com/royaljersey.bd",
  about_text: "Royal Jersey BD was born from a passion for football and frustration with low-quality, overpriced jerseys. We set out to build something different — premium quality, honest pricing, and a brand Bangladeshis can be proud of.\n\nFrom a small Facebook page to a full-fledged e-commerce store, thousands of fans and athletes across Bangladesh now trust us for their sportswear. Every jersey we sell carries our commitment to quality and your pride.",
  faq_items: JSON.stringify([
    { question: "What fabric types do you offer?", answer: "We offer Lorex, Box Mash, and Leap Jacquard fabrics — each with unique properties for different needs." },
    { question: "How long does delivery take?", answer: "Inside Dhaka: 24-48 hours. Outside Dhaka: 3-5 business days." },
    { question: "Do you accept returns?", answer: "Yes! We offer 7-day easy returns for wrong size or defective products." },
    { question: "What payment methods do you accept?", answer: "We accept bKash, Nagad, card payments, and Cash on Delivery (COD)." },
  ]),
  hero_slides: JSON.stringify([
    { title: "PREMIUM LOREX FABRIC", subtitle: "EXPERIENCE LUXURY ON THE PITCH", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop", cta: "Shop Lorex Edition", link: "/products?fabric=lorex" },
    { title: "PLAYER EDITION", subtitle: "AUTHENTIC FIT. ULTIMATE PERFORMANCE.", image: "https://images.unsplash.com/photo-1518063319808-ce6e719ed025?q=80&w=2070&auto=format&fit=crop", cta: "Discover Player Editions", link: "/products?edition=player" },
    { title: "ROYAL CUSTOM", subtitle: "YOUR TEAM. YOUR COLORS. OUR CRAFT.", image: "https://images.unsplash.com/photo-1522778526114-f2a4bbcefb66?q=80&w=2065&auto=format&fit=crop", cta: "Bulk Orders", link: "/contact" },
  ]),
  edition_player_image: "https://images.unsplash.com/photo-1600147184288-024d29f8f2b6?q=80&w=2070&auto=format&fit=crop",
  edition_fan_image: "https://images.unsplash.com/photo-1508344928928-7137b2f6b8b0?q=80&w=2070&auto=format&fit=crop",
  edition_kid_image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=2070&auto=format&fit=crop",
  edition_premium_image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1974&auto=format&fit=crop",
  fabric_image_1: "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?q=80&w=1974&auto=format&fit=crop",
  fabric_image_2: "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?q=80&w=1998&auto=format&fit=crop",
  fabric_image_3: "https://images.unsplash.com/photo-1608248593842-b054238e4a9e?q=80&w=1974&auto=format&fit=crop",
  fabric_image_4: "https://images.unsplash.com/photo-1544413660-299165566b1d?q=80&w=1974&auto=format&fit=crop",
  offer_slider_enabled: "true",
  offer_slider_title: "SHOP EVERY LEAGUE",
  offer_slider_subtext: "PREMIUM JERSEYS. FAST DELIVERY.",
  offer_slider_cta_text: "Shop Now",
  offer_slider_cta_link: "/products",
  offer_slider_images: JSON.stringify([]),
};

router.get("/site-settings", async (_req, res) => {
  try {
    const rows = await db.select().from(siteSettingsTable);
    const settings = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return res.json(settings);
  } catch {
    return res.json(DEFAULT_SETTINGS);
  }
});

export default router;
