import { createFileRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({ component: AuthLayout });

function AuthLayout() {
  return (
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-5rem)]">
      <div className="hidden lg:block relative bg-secondary overflow-hidden">
        <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1400&q=85" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/20" />
        <div className="absolute bottom-10 left-10 text-background max-w-sm">
          <p className="font-serif text-3xl italic">"A small atelier of honest things, kept by people who care."</p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.3em] opacity-70">— Apartamento, Nº 28</p>
        </div>
        <Link to="/" className="absolute top-10 left-10 font-serif text-xl tracking-[0.2em] uppercase text-background">Souvenir</Link>
      </div>
      <div className="flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm"><Outlet /></div>
      </div>
    </div>
  );
}
