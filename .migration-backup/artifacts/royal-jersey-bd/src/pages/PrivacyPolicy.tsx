import { motion } from "framer-motion";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: `When you use Royal Jersey BD, we may collect the following information:
      
• Name, phone number, and email address when you place an order or create an account.
• Delivery address and billing information.
• Order history and preferences.
• Device information and IP address for security and analytics purposes.
• Payment information (processed securely — we do not store full card numbers).`
    },
    {
      title: "2. How We Use Your Information",
      content: `We use the information we collect to:
      
• Process and fulfill your orders.
• Send order confirmations, shipping updates, and delivery notifications via SMS and WhatsApp.
• Respond to your inquiries and provide customer support.
• Improve our website, products, and services.
• Send promotional offers (only if you've opted in — you can unsubscribe anytime).
• Prevent fraud and ensure the security of your account.`
    },
    {
      title: "3. Information Sharing",
      content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only with:
      
• Courier partners (Pathao, Redx, SA Paribahan) solely to fulfill your delivery.
• Payment processors (bKash, Nagad, bank gateways) to complete transactions.
• Legal authorities if required by Bangladeshi law.
      
All third parties are required to keep your information confidential.`
    },
    {
      title: "4. Data Security",
      content: `We take reasonable measures to protect your personal information:
      
• HTTPS encryption for all data transmitted through our website.
• Secure, limited-access storage for personal and payment data.
• Regular security reviews.
      
While we take all reasonable precautions, no method of transmission over the internet is 100% secure.`
    },
    {
      title: "5. Cookies",
      content: `Our website uses cookies to:
      
• Remember your cart and preferences.
• Analyze website traffic to improve your experience.
• Enable secure authentication.
      
You can disable cookies in your browser settings, but this may affect some website functionality.`
    },
    {
      title: "6. Your Rights",
      content: `You have the right to:
      
• Access the personal information we hold about you.
• Request correction of inaccurate information.
• Request deletion of your account and associated data.
• Opt out of marketing communications at any time.
      
To exercise any of these rights, contact us at support@royaljersey.bd or via WhatsApp.`
    },
    {
      title: "7. Children's Privacy",
      content: "Our services are not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately."
    },
    {
      title: "8. Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our website. Your continued use of our services after changes are posted constitutes your acceptance of the new policy."
    },
    {
      title: "9. Contact Us",
      content: "If you have any questions about this Privacy Policy, please contact us:\n\n• Email: support@royaljersey.bd\n• WhatsApp: +880 1234-567890\n• Address: House 12, Road 5, Block A, Mirpur, Dhaka 1216"
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link> / <span className="text-foreground">Privacy Policy</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-serif font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-10">Last updated: May 2026</p>
          <p className="text-muted-foreground leading-relaxed mb-10">
            Royal Jersey BD ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or place an order with us.
          </p>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border-b pb-8 last:border-0"
              >
                <h2 className="text-xl font-serif font-bold mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">{section.content}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
