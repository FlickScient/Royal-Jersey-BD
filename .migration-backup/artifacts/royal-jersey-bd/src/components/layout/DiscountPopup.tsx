import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DiscountPopup() {
  const [show, setShow] = useState(false);
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const PROMO_CODE = "ROYAL10";

  useEffect(() => {
    const dismissed = localStorage.getItem("rj_popup_dismissed");
    if (dismissed) return;
    const timer = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("rj_popup_dismissed", "1");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    localStorage.setItem("rj_popup_dismissed", "1");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMO_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md bg-card rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Top banner */}
            <div className="bg-[#1a2744] px-6 pt-8 pb-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/30">
                  <Gift className="w-7 h-7 text-primary" />
                </div>
                <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Welcome Offer</p>
                <h2 className="text-4xl font-serif font-bold text-white mb-1">10% OFF</h2>
                <p className="text-gray-300 text-sm">Your First Order</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {!submitted ? (
                <>
                  <p className="text-center text-muted-foreground text-sm mb-5">Enter your phone number to get your exclusive discount code.</p>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="text-center text-lg h-12"
                    />
                    <Button type="submit" size="lg" className="w-full font-bold">
                      Claim My 10% Discount
                    </Button>
                  </form>
                  <p className="text-xs text-center text-muted-foreground mt-4">No spam, ever. Unsubscribe anytime.</p>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground text-sm">Your code is ready! Use it at checkout:</p>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-dashed border-primary/50">
                    <span className="flex-1 font-mono font-bold text-xl text-primary text-center tracking-widest">{PROMO_CODE}</span>
                    <Button size="sm" variant="ghost" onClick={handleCopy} className="flex-shrink-0">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Valid for 7 days · New customers only · Min. order ৳500</p>
                  <Button onClick={dismiss} className="w-full">Start Shopping</Button>
                </div>
              )}

              <button
                onClick={dismiss}
                className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
              >
                No thanks, I'll pay full price
              </button>
            </div>

            <button
              onClick={dismiss}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
