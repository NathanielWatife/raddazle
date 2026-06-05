import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Facebook, Sparkles, Mail } from "lucide-react";

const cols = [
  {
    title: "Shop",
    links: [
      { to: "/shop", label: "All Products" },
      { to: "/shop", label: "New Arrivals" },
      { to: "/shop", label: "Best Sellers" },
      { to: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/faq", label: "FAQ" },
      { to: "/return", label: "Returns" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-elevated">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/img/favicon.ico"
                alt="Raddazle Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="font-display text-lg font-bold tracking-tight">Raddazle</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Luxury scents and daily essentials, 100% authentic — delivered to your door.
            </p>
            <form
              className="mt-6 flex max-w-sm overflow-hidden rounded-full border border-border bg-background pl-4 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-ring/40"
              onSubmit={(e) => e.preventDefault()}
            >
              <Mail className="my-auto h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email for new drops"
                className="w-full bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
                Join
              </button>
            </form>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {c.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-foreground/80 transition hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Raddazle. All rights reserved.
          </p>
          <div className="flex gap-2">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                aria-label="Social"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
