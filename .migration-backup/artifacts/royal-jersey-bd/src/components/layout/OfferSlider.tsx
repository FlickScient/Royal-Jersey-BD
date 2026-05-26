import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OfferSliderProps {
  title: string;
  subtext: string;
  ctaText: string;
  ctaLink: string;
  images: string[];
}

export default function OfferSlider({ title, subtext, ctaText, ctaLink, images }: OfferSliderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => {
      setCurrent(i => (i + 1) % images.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [images.length]);

  const getCardStyle = (offset: number) => {
    const abs = Math.abs(offset);
    if (abs === 0) return { x: 0, scale: 1, rotateY: 0, zIndex: 10, opacity: 1, brightness: 1 };
    if (abs === 1) return { x: offset * 158, scale: 0.79, rotateY: offset * -22, zIndex: 6, opacity: 0.85, brightness: 0.72 };
    if (abs === 2) return { x: offset * 248, scale: 0.61, rotateY: offset * -38, zIndex: 3, opacity: 0.55, brightness: 0.45 };
    return { x: offset * 300, scale: 0.44, rotateY: offset * -48, zIndex: 1, opacity: 0, brightness: 0.3 };
  };

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length);
  const next = () => setCurrent(i => (i + 1) % images.length);

  if (images.length === 0) return null;

  return (
    <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #060d1a 0%, #0a1428 50%, #060d1a 100%)' }}>
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#c9a84c]/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4">
        {/* Text header */}
        <div className="text-center mb-14">
          <p className="text-[#c9a84c] font-bold tracking-[0.45em] uppercase text-[10px] mb-5">
            {title}
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-black text-white leading-tight max-w-3xl mx-auto">
            {subtext}
          </h2>
        </div>

        {/* 3D Card Carousel — overflow hidden clips side cards for the "peeking" effect */}
        <div className="relative overflow-hidden" style={{ height: '400px' }}>
          <div
            className="flex justify-center items-center h-full"
            style={{ perspective: '1100px' }}
          >
            {images.map((img, i) => {
              let offset = i - current;
              if (offset > images.length / 2) offset -= images.length;
              if (offset < -images.length / 2) offset += images.length;
              if (Math.abs(offset) > 2) return null;

              const s = getCardStyle(offset);

              return (
                <motion.div
                  key={i}
                  className="absolute cursor-pointer"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{
                    x: s.x,
                    scale: s.scale,
                    rotateY: s.rotateY,
                    zIndex: s.zIndex,
                    opacity: s.opacity,
                  }}
                  transition={{ duration: 0.58, ease: [0.25, 0.46, 0.45, 0.94] }}
                  onClick={() => setCurrent(i)}
                >
                  <motion.div
                    className="w-[185px] h-[370px] rounded-[28px] overflow-hidden border-2 border-white/15 bg-[#111827] shadow-2xl shadow-black/80 relative select-none"
                    animate={{ filter: `brightness(${s.brightness})` }}
                    transition={{ duration: 0.58 }}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                    {/* Center-card shine ring */}
                    {offset === 0 && (
                      <div className="absolute inset-0 rounded-[26px] ring-2 ring-[#c9a84c]/40 ring-offset-0" />
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Navigation row */}
        <div className="flex items-center justify-center gap-5 mt-8">
          <button
            onClick={prev}
            className="p-2.5 rounded-full border border-white/20 text-white/70 hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all duration-200 hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 h-2 bg-[#c9a84c]'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="p-2.5 rounded-full border border-white/20 text-white/70 hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all duration-200 hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link href={ctaLink}>
            <button className="bg-[#c9a84c] text-black font-bold px-12 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-[#e8c76d] transition-all duration-200 shadow-lg shadow-[#c9a84c]/25 hover:shadow-xl hover:shadow-[#c9a84c]/35 hover:scale-105 active:scale-100">
              {ctaText}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
