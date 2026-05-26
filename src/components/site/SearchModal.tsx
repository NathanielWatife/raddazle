import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { products } from "@/data/products";

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products.slice(0, 4);
    return products.filter((p) => `${p.name} ${p.origin} ${p.category}`.toLowerCase().includes(term)).slice(0, 6);
  }, [q]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-background/70 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-0 z-50 bg-background border-b hairline"
          >
            <div className="mx-auto max-w-[1400px] px-5 lg:px-10 py-6">
              <div className="flex items-center gap-4 border-b hairline pb-4">
                <Search className="h-5 w-5 text-muted-foreground" strokeWidth={1.25} />
                <input
                  autoFocus value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Search objects, places, makers…"
                  className="flex-1 bg-transparent font-serif text-2xl lg:text-3xl outline-none placeholder:text-muted-foreground"
                />
                <button onClick={onClose} className="p-1" aria-label="Close"><X className="h-5 w-5" strokeWidth={1.25} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 py-8">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
                    {q ? `${results.length} results` : "Popular"}
                  </p>
                  <ul>
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link to="/shop/$slug" params={{ slug: p.slug }} onClick={onClose} className="flex items-center gap-4 py-3 border-b hairline group">
                          <img src={p.images[0]} alt={p.name} className="h-14 w-14 object-cover" loading="lazy" />
                          <div className="flex-1">
                            <p className="font-serif text-lg group-hover:italic transition-all">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.origin}</p>
                          </div>
                          <span className="text-sm tabular-nums">€{p.price}</span>
                        </Link>
                      </li>
                    ))}
                    {q && results.length === 0 && <p className="text-sm text-muted-foreground py-6">No matches. Try a place, a material, a season.</p>}
                  </ul>
                </div>
                <div className="hidden md:block">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Browse by</p>
                  <div className="flex flex-wrap gap-2">
                    {["Kyoto", "Lisbon", "Paris", "Oaxaca", "Florence", "Copenhagen", "Marrakech"].map((c) => (
                      <button key={c} onClick={() => setQ(c)} className="text-xs px-3 py-1.5 border hairline hover:bg-secondary transition-colors">{c}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
