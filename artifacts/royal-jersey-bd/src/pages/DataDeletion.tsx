import { motion } from "framer-motion";
import { Link } from "wouter";

export default function DataDeletion() {
  const sections = [
    {
      title: "1. How to Request Deletion",
      content: `If you'd like your personal data deleted from Royal Jersey BD's systems, send an email to support@royaljersey.bd with the subject line "Data Deletion Request" and include:

• Your full name.
• The phone number or email used on your account or order(s).
• Any order ID(s), if available.

You can also message us directly via WhatsApp with the same details.`,
    },
    {
      title: "2. What Gets Deleted",
      content: `Once verified, we will permanently delete the following from our active systems:

• Your account details (name, phone, email, address).
• Saved payment preferences.
• Order history and wishlist/cart data.`,
    },
    {
      title: "3. What We May Retain",
      content: `We may retain limited transaction records (e.g. invoices) where required by Bangladeshi tax or accounting law, even after a deletion request. This data is kept solely for legal compliance and is not used for any other purpose.`,
    },
    {
      title: "4. Processing Time",
      content: `We process deletion requests within 30 days and will send a confirmation email once your data has been removed.`,
    },
    {
      title: "5. Contact Us",
      content: `Questions about this process?\n\n• Email: support@royaljersey.bd\n• WhatsApp: available via our Contact page`,
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2"
        >
          User Data Deletion
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: October 2026</p>

        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
            <p className="whitespace-pre-line text-muted-foreground">{section.content}</p>
          </motion.div>
        ))}

        <Link href="/privacy-policy" className="text-sm underline">
          View our Privacy Policy
        </Link>
      </div>
    </div>
  );
}
