import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    category: "Orders & Payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept bKash, Nagad, Rocket, all major debit/credit cards, and Cash on Delivery (COD) for orders within Bangladesh. COD is available for all districts."
      },
      {
        q: "How do I place an order?",
        a: "Simply browse our products, select your size and quantity, add to cart, and proceed to checkout. You can also order directly via WhatsApp at +880 1234-567890."
      },
      {
        q: "Can I cancel or change my order?",
        a: "You can cancel or modify your order within 2 hours of placing it. After that, the order may have already been processed. Contact us on WhatsApp immediately if you need changes."
      },
      {
        q: "Do you offer bulk/team orders?",
        a: "Yes! We offer special discounts for bulk orders of 10+ pieces. Contact us on WhatsApp or email for a custom quote and customization options."
      }
    ]
  },
  {
    category: "Delivery & Shipping",
    items: [
      {
        q: "How long does delivery take?",
        a: "Inside Dhaka: 24–48 hours. Outside Dhaka (all districts): 3–5 business days. We partner with Pathao, Redx, and SA Paribahan for reliable delivery."
      },
      {
        q: "How much is the delivery charge?",
        a: "Inside Dhaka: ৳70. Outside Dhaka: ৳120. Free delivery on orders above ৳2,000."
      },
      {
        q: "Do you deliver to all districts?",
        a: "Yes, we deliver to all 64 districts of Bangladesh through our courier partners."
      },
      {
        q: "How can I track my order?",
        a: "Once your order is shipped, you'll receive a tracking number via SMS and WhatsApp. You can use the Track Order page or contact our support team."
      }
    ]
  },
  {
    category: "Products & Sizing",
    items: [
      {
        q: "How do I find the right size?",
        a: "We recommend checking our Size Guide page for detailed measurements. Our jerseys generally run slightly slim — if you're between sizes, we suggest sizing up for a comfortable fit."
      },
      {
        q: "What fabrics do you use?",
        a: "We use premium fabrics including Lorex (silky sheen), Box Mash (durable texture), and Leap Jacquard (breathable mesh). Each product page specifies the fabric type used."
      },
      {
        q: "Are these original/authentic jerseys?",
        a: "Our jerseys are premium grade replicas — the same quality as what you'd find in official club shops, made with identical fabrics and printing techniques. We clearly label each edition (Player Edition, Fan Edition, etc.)."
      },
      {
        q: "Can I customize a jersey with my name and number?",
        a: "Yes! We offer custom name and number printing. Add your customization details in the order notes or message us on WhatsApp. Custom orders take an additional 1–2 days."
      }
    ]
  },
  {
    category: "Returns & Exchange",
    items: [
      {
        q: "What is your return policy?",
        a: "We offer 7-day returns for items in original, unworn condition with tags attached. Returns are accepted for wrong size, defective products, or wrong item delivered."
      },
      {
        q: "How do I return or exchange an item?",
        a: "Contact us on WhatsApp with your order number and reason for return. We'll guide you through the process. Courier charges for returns are covered by us if the issue is on our end."
      },
      {
        q: "How long does a refund take?",
        a: "Refunds are processed within 3–5 business days after we receive the returned item. bKash/Nagad refunds are instant once processed."
      }
    ]
  }
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="font-medium pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t bg-muted/10">
              <p className="pt-4">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen pt-20">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link> / <span className="text-foreground">FAQ</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Got questions? We've got answers. If you can't find what you're looking for, chat with us on WhatsApp.</p>
        </motion.div>

        <div className="space-y-10">
          {faqs.map((section, si) => (
            <motion.div
              key={si}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: si * 0.1 }}
            >
              <h2 className="text-xl font-serif font-bold mb-4 text-primary">{section.category}</h2>
              <div className="space-y-3">
                {section.items.map((item, ii) => (
                  <FAQItem key={ii} q={item.q} a={item.a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center p-8 rounded-xl bg-[#1a2744] text-white"
        >
          <h3 className="text-2xl font-serif font-bold mb-2">Still have questions?</h3>
          <p className="text-gray-300 mb-6">Our support team is available 7 days a week. We typically respond in under 10 minutes.</p>
          <Button asChild className="bg-[#25D366] hover:bg-[#1ea855] text-white">
            <a href="https://wa.me/+8801234567890" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat on WhatsApp
            </a>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
