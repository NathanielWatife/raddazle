import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/register")({
  head: () => ({ meta: [{ title: "Create account — SOUVENIR" }] }),
  component: Register,
});

function Register() {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Join the atelier</p>
      <h1 className="mt-3 font-serif text-5xl">Create account.</h1>
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Welcome to Souvenir."); }} className="mt-10 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" required />
          <Field label="Last name" required />
        </div>
        <Field label="Email" type="email" required />
        <Field label="Password" type="password" required />
        <label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" required className="mt-0.5 accent-foreground" /> I'd like to receive the Sunday letter.</label>
        <button className="w-full bg-foreground text-background py-3.5 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground/90">Create account</button>
      </form>
      <p className="mt-8 text-sm text-center text-muted-foreground">Already have one? <Link to="/auth/login" className="text-foreground link-underline">Sign in</Link></p>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <input {...rest} className="mt-1.5 w-full bg-transparent border-b hairline py-2.5 text-sm outline-none focus:border-foreground" />
    </label>
  );
}
