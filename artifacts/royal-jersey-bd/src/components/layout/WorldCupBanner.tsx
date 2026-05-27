import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";

const KICKOFF_MS = new Date("2026-06-11T00:00:00Z").getTime();

function calcTimeLeft() {
  const diff = KICKOFF_MS - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function WorldCupBanner() {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <section className="relative overflow-hidden bg-[#0a0f1e] text-white">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2293&auto=format&fit=crop"
          alt="World Cup Stadium"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e] via-[#0a0f1e]/80 to-[#0a0f1e]/40" />
      </div>

      {/* Animated background glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Diagonal stripe decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-12 bg-white -skew-x-12"
            style={{ left: `${i * 160 + 40}px` }}
          />
        ))}
      </div>

      <div className="relative container mx-auto px-4 py-14 md:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left — Text content */}
          <div className="space-y-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 flex-wrap"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/40 text-[#c9a84c] text-xs font-bold uppercase tracking-widest">
                <Trophy className="w-3.5 h-3.5" />
                FIFA World Cup 2026
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                Exclusive Collection
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black leading-[1.05] tracking-tight">
                THE WORLD CUP
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a84c] via-yellow-300 to-[#c9a84c]">
                  2026 EDITION
                </span>
              </h2>
              <p className="mt-4 text-gray-300 text-base md:text-lg max-w-lg leading-relaxed">
                Own your nation's jersey before they sell out. Premium Lorex & Box Mash fabric — 
                every kit from USA, England, Brazil, Argentina, Germany & more. Exclusively at Royal Jersey BD.
              </p>
            </motion.div>

            {/* Host nations flags row */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 flex-wrap"
            >
              <span className="text-xs text-gray-500 uppercase tracking-wider">Host Nations:</span>
              {["🇺🇸 USA", "🇨🇦 Canada", "🇲🇽 Mexico"].map(n => (
                <span key={n} className="text-sm font-medium bg-white/10 px-2.5 py-1 rounded-md border border-white/10">{n}</span>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              <Link href="/products?categoryId=1">
                <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#c9a84c] to-yellow-400 hover:from-yellow-400 hover:to-[#c9a84c] text-black font-bold px-7 py-3.5 rounded-none text-sm uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#c9a84c]/30">
                  Shop World Cup Jerseys
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 hover:bg-white/5 text-white font-semibold px-7 py-3.5 rounded-none text-sm uppercase tracking-wider transition-all duration-300">
                  Bulk Orders
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Right — Countdown */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center lg:items-end gap-6"
          >
            {/* Trophy icon big */}
            <div className="hidden lg:flex w-24 h-24 rounded-full bg-gradient-to-br from-[#c9a84c] to-yellow-600 items-center justify-center shadow-2xl shadow-[#c9a84c]/40">
              <Trophy className="w-12 h-12 text-black" />
            </div>

            {/* Countdown box */}
            <div className="w-full max-w-sm">
              <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-4 font-semibold">
                ⏳ Kicks Off In
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: days, label: "Days" },
                  { val: hours, label: "Hours" },
                  { val: minutes, label: "Mins" },
                  { val: seconds, label: "Secs" },
                ].map(({ val, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center bg-white/5 border border-white/10 rounded-lg py-4 backdrop-blur-sm"
                  >
                    <span className="text-3xl md:text-4xl font-black tabular-nums text-[#c9a84c] font-mono">
                      {String(val).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{label}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-600 mt-3">June 11, 2026 · USA / Canada / Mexico</p>
            </div>

            {/* Popular nations */}
            <div className="w-full max-w-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Available Kits</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "🇧🇷 Brazil", "🇦🇷 Argentina", "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England",
                  "🇩🇪 Germany", "🇫🇷 France", "🇵🇹 Portugal",
                  "🇪🇸 Spain", "🇺🇸 USA", "+ More"
                ].map(n => (
                  <span
                    key={n}
                    className="text-xs font-medium bg-white/8 hover:bg-white/15 border border-white/10 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom strip */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap gap-4 justify-between items-center text-xs text-gray-500">
          <span>🔥 Limited stock — pre-order now to guarantee your size</span>
          <span className="text-[#c9a84c] font-semibold">Free delivery on World Cup orders above ৳2,000</span>
        </div>
      </div>
    </section>
  );
}
