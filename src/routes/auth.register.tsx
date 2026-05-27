import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { register } from "@/lib/api";

export const Route = createFileRoute("/auth/register")({
  head: () => ({ meta: [{ title: "Create account — SOUVENIR" }] }),
  component: Register,
});

function Register() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success("Welcome to Souvenir. Please check your email to verify.");
      router.navigate({ to: "/auth/login" });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Registration failed. Try again.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = `${firstName} ${lastName}`.trim();
    registerMutation.mutate({ name, firstName, lastName, email, password });
  };

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Join the atelier</p>
      <h1 className="mt-3 font-serif text-5xl">Create account.</h1>
      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Field label="Last name" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" required className="mt-0.5 accent-foreground" /> I'd like to receive the Sunday letter.</label>
        <button disabled={registerMutation.isPending} className="w-full bg-foreground text-background py-3.5 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground/90 disabled:opacity-50">
          {registerMutation.isPending ? "Creating..." : "Create account"}
        </button>
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
