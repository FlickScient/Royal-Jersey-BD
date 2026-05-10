import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useGetSiteSettings } from "@workspace/api-client-react";

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const { data: siteSettings } = useGetSiteSettings();
  const whatsappNumber = siteSettings?.whatsapp_number || "+8801234567890";
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <motion.a
      href={`https://wa.me/${cleanNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-testid="link-whatsapp"
    >
      <MessageCircle className="w-8 h-8" />
      {isHovered && (
        <motion.span
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          className="ml-2 font-medium whitespace-nowrap overflow-hidden pr-2"
        >
          Chat with us
        </motion.span>
      )}
    </motion.a>
  );
}
