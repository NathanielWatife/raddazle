import { Link, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingBag, Heart, User, Menu, X, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { SearchModal } from "./SearchModal";
import { categories } from "@/data/products";

const navLinks = [
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "Atelier" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
] as const;

export function Navbar() {
  const { cartCount, wishlist } = useStore();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-foreground text-background text-[11px] uppercase tracking-[0.3em] py-2 text-center overflow-hidden">
        <div className="flex whitespace-nowrap marquee gap-16">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-16 shrink-0">
              <span>Complimentary shipping over €150</span>
              <span>·</span>
              <span>Hand-wrapped in Lisbon</span>
              <span>·</span>
              <span>New: Copenhagen Stoneware</span>
              <span>·</span>
              <span>Edition of 200 — Florentine Journal</span>
              <span>·</span>
            </div>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled ? "bg-background/85 backdrop-blur-md border-b hairline" : "bg-background border-b border-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left: mobile menu + nav */}
            <div className="flex items-center gap-8 flex-1">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden -ml-2 p-2" aria-label="Open menu">
                <Menu className="h-5 w-5" strokeWidth={1.25} />
              </button>
              <nav className="hidden lg:flex items-center gap-8 text-[12px] uppercase tracking-[0.18em]">
                <div onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)} className="relative">
                  <Link to="/shop" className="hover:opacity-60 transition-opacity">Shop</Link>
                  <AnimatePresence>
                    {megaOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full pt-4"
                      >
                        <div className="bg-background border hairline w-[640px] p-8 grid grid-cols-2 gap-x-10 gap-y-4 shadow-2xl shadow-black/5">
                          <div>
                            <p className="font-serif italic text-xs text-muted-foreground mb-3 normal-case tracking-normal">Browse</p>
                            <ul className="space-y-2">
                              {categories.map((c) => (
                                <li key={c.slug}>
                                  <Link to="/shop" search={{ category: c.slug }} className="flex justify-between hover:opacity-60 normal-case tracking-normal text-sm">
                                    <span>{c.name}</span>
                                    <span className="text-muted-foreground tabular-nums">{String(c.count).padStart(2, "0")}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="border-l hairline pl-10">
                            <p className="font-serif italic text-xs text-muted-foreground mb-3 normal-case tracking-normal">Editions</p>
                            <p className="font-serif text-2xl leading-tight">Objects with a passport, a maker, a story.</p>
                            <Link to="/shop" className="mt-4 inline-block text-[11px] tracking-[0.25em] link-underline">View all →</Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {navLinks.slice(1).map((l) => (
                  <Link key={l.to} to={l.to} className="hover:opacity-60 transition-opacity" activeProps={{ className: "opacity-100 [&]:font-medium" }}>
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center logo */}
            <Link to="/" className="font-serif text-2xl lg:text-3xl tracking-[0.2em] uppercase select-none">
              Souvenir
            </Link>

            {/* Right */}
            <div className="flex items-center gap-1 lg:gap-2 flex-1 justify-end">
              <button onClick={() => setSearchOpen(true)} className="p-2 hover:opacity-60" aria-label="Search">
                <Search className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </button>
              <button onClick={toggle} className="p-2 hover:opacity-60 hidden sm:block" aria-label="Toggle theme">
                {theme === "light" ? <Moon className="h-[18px] w-[18px]" strokeWidth={1.25} /> : <Sun className="h-[18px] w-[18px]" strokeWidth={1.25} />}
              </button>
              <Link to="/auth/login" className="p-2 hover:opacity-60 hidden sm:block" aria-label="Account">
                <User className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </Link>
              <Link to="/wishlist" className="p-2 hover:opacity-60 relative" aria-label="Wishlist">
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.25} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-[10px] tabular-nums bg-foreground text-background rounded-full h-4 w-4 flex items-center justify-center">{wishlist.length}</span>
                )}
              </Link>
              <Link to="/cart" className="p-2 hover:opacity-60 relative" aria-label="Cart">
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.25} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 text-[10px] tabular-nums bg-foreground text-background rounded-full h-4 w-4 flex items-center justify-center"
                  >{cartCount}</motion.span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm bg-background p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-serif text-xl tracking-[0.2em] uppercase">Souvenir</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close"><X className="h-5 w-5" strokeWidth={1.25} /></button>
              </div>
              <nav className="flex flex-col gap-1 font-serif text-3xl">
                <Link to="/shop" className="py-2">Shop</Link>
                {categories.map((c) => (
                  <Link key={c.slug} to="/shop" search={{ category: c.slug }} className="py-2 text-base font-sans pl-4 text-muted-foreground">{c.name}</Link>
                ))}
                <div className="h-px bg-border my-4" />
                <Link to="/about" className="py-2">Atelier</Link>
                <Link to="/contact" className="py-2">Contact</Link>
                <Link to="/faq" className="py-2">FAQ</Link>
                <Link to="/auth/login" className="py-2">Account</Link>
              </nav>
              <div className="mt-auto pt-6 border-t hairline flex items-center justify-between text-xs uppercase tracking-[0.2em]">
                <button onClick={toggle} className="flex items-center gap-2">
                  {theme === "light" ? <Moon className="h-4 w-4" strokeWidth={1.25} /> : <Sun className="h-4 w-4" strokeWidth={1.25} />}
                  {theme === "light" ? "Dark" : "Light"}
                </button>
                <span className="text-muted-foreground normal-case tracking-normal">© SOUVENIR</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
