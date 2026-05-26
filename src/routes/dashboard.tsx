import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, MapPin, Heart, CreditCard, Settings, LogOut, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SOUVENIR" }] }),
  component: Dashboard,
});

const orders = [
  { id: "SVN-04219", date: "12 Sep 2026", items: 3, total: 248, status: "In transit" },
  { id: "SVN-04102", date: "28 Aug 2026", items: 1, total: 124, status: "Delivered" },
  { id: "SVN-03987", date: "14 Jul 2026", items: 2, total: 156, status: "Delivered" },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 lg:px-10 py-12 lg:py-16">
      <header className="border-b hairline pb-8 mb-10">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Welcome back</p>
        <h1 className="mt-3 font-serif text-5xl lg:text-7xl">Eloise <em className="italic">Renault</em>.</h1>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <nav className="space-y-1 text-sm">
            {[
              { i: Package, l: "Orders", active: true },
              { i: MapPin, l: "Addresses" },
              { i: Heart, l: "Wishlist" },
              { i: CreditCard, l: "Payment" },
              { i: Settings, l: "Settings" },
              { i: LogOut, l: "Sign out" },
            ].map((n) => (
              <button key={n.l} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${n.active ? "bg-foreground text-background" : "hover:bg-secondary"}`}>
                <n.i className="h-4 w-4" strokeWidth={1.25} /> {n.l}
              </button>
            ))}
          </nav>
        </aside>

        <div className="lg:col-span-9 space-y-10">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-px bg-border">
            {[
              { l: "Orders", v: "12" },
              { l: "Saved", v: "07" },
              { l: "Credit", v: "€45" },
            ].map((s) => (
              <div key={s.l} className="bg-background p-6 lg:p-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.l}</p>
                <p className="font-serif text-5xl mt-2 tabular-nums">{s.v}</p>
              </div>
            ))}
          </div>

          {/* Orders */}
          <section>
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-serif text-3xl">Recent orders</h2>
              <Link to="/track" className="text-[11px] uppercase tracking-[0.25em] link-underline">Track →</Link>
            </div>
            <div className="border hairline">
              {orders.map((o, i) => (
                <div key={o.id} className={`flex items-center gap-4 p-5 ${i > 0 ? "border-t hairline" : ""} hover:bg-secondary/40 transition-colors`}>
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div><p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Order</p><p className="font-mono mt-1">{o.id}</p></div>
                    <div><p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Date</p><p className="mt-1">{o.date}</p></div>
                    <div><p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Items</p><p className="mt-1">{o.items}</p></div>
                    <div><p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Total</p><p className="mt-1 tabular-nums">€{o.total}</p></div>
                    <div><p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Status</p><p className="mt-1">{o.status}</p></div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
