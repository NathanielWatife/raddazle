import { Link } from "@tanstack/react-router";
import { Instagram, Mail } from "lucide-react";
import { toast } from "sonner";

export function Footer() {
  return (
    <footer className="border-t hairline bg-background mt-24">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="font-serif text-4xl lg:text-5xl leading-[1.05] max-w-md">
              Letters from elsewhere, <em className="italic">delivered Sundays.</em>
            </p>
            <p className="text-sm text-muted-foreground mt-4 max-w-sm">
              New editions, dispatches from the makers, and the occasional recipe.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); toast.success("Welcome aboard. First letter posts Sunday."); (e.target as HTMLFormElement).reset(); }}
              className="mt-8 flex border-b hairline pb-3 max-w-md"
            >
              <Mail className="h-4 w-4 mt-1 mr-3 text-muted-foreground" strokeWidth={1.25} />
              <input type="email" required placeholder="your@address.com" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              <button type="submit" className="text-[11px] uppercase tracking-[0.25em] hover:opacity-60">Subscribe →</button>
            </form>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm">
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Shop</h4>
              <ul className="space-y-2.5">
                <li><Link to="/shop" className="link-underline">All objects</Link></li>
                <li><Link to="/shop" search={{ category: "objects" }} className="link-underline">Objects</Link></li>
                <li><Link to="/shop" search={{ category: "paper" }} className="link-underline">Paper</Link></li>
                <li><Link to="/shop" search={{ category: "textiles" }} className="link-underline">Textiles</Link></li>
                <li><Link to="/shop" search={{ category: "scent" }} className="link-underline">Scent</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">House</h4>
              <ul className="space-y-2.5">
                <li><Link to="/about" className="link-underline">Atelier</Link></li>
                <li><Link to="/contact" className="link-underline">Contact</Link></li>
                <li><Link to="/faq" className="link-underline">FAQ</Link></li>
                <li><Link to="/track" className="link-underline">Track order</Link></li>
                <li><Link to="/dashboard" className="link-underline">Account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Elsewhere</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="link-underline">Instagram</a></li>
                <li><a href="#" className="link-underline">Pinterest</a></li>
                <li><a href="#" className="link-underline">Journal</a></li>
                <li><a href="#" className="link-underline">Press</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t hairline flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SOUVENIR · Objects worth keeping.</p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="link-underline">Privacy</a>
            <a href="#" className="link-underline">Terms</a>
            <a href="#" className="link-underline">Shipping</a>
            <a href="#" aria-label="Instagram" className="hover:opacity-60"><Instagram className="h-4 w-4" strokeWidth={1.25} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
