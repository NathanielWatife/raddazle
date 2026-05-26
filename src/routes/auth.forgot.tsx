import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({ meta: [{ title: "Forgot password — SOUVENIR" }] }),
  component: Forgot,
});

function Forgot() {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">No trouble</p>
      <h1 className="mt-3 font-serif text-5xl">Reset password.</h1>
      <p className="mt-4 text-sm text-muted-foreground">We'll send a fresh link to your inbox.</p>
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Check your email."); }} className="mt-10 space-y-5">
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Email</span>
          <input type="email" required className="mt-1.5 w-full bg-transparent border-b hairline py-2.5 text-sm outline-none focus:border-foreground" />
        </label>
        <button className="w-full bg-foreground text-background py-3.5 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground/90">Send reset link</button>
      </form>
      <p className="mt-8 text-sm text-center text-muted-foreground"><Link to="/auth/login" className="link-underline">← Back to sign in</Link></p>
    </div>
  );
}
