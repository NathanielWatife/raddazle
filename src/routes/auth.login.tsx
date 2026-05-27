import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/api";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign in — SOUVENIR" }] }),
  component: Login,
});

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      toast.success("Signed in successfully!");
      // Could set user in global store context here
      router.navigate({ to: "/dashboard" });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Invalid email or password");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Welcome back</p>
      <h1 className="mt-3 font-serif text-5xl">Sign in.</h1>
      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex justify-between text-xs">
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-foreground" /> Remember me</label>
          <Link to="/auth/forgot" className="link-underline">Forgot password?</Link>
        </div>
        <button disabled={loginMutation.isPending} className="w-full bg-foreground text-background py-3.5 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground/90 disabled:opacity-50">
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground"><div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" /></div>
      <button className="mt-6 w-full border hairline py-3.5 text-[11px] uppercase tracking-[0.3em] hover:bg-secondary">Continue with Google</button>
      <p className="mt-8 text-sm text-center text-muted-foreground">No account? <Link to="/auth/register" className="text-foreground link-underline">Create one</Link></p>
    </div>
  );
}

function Input({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <input {...rest} className="mt-1.5 w-full bg-transparent border-b hairline py-2.5 text-sm outline-none focus:border-foreground" />
    </label>
  );
}
