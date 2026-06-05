import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, refresh, isAuthenticated, isAdmin } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isAdmin) navigate({ to: "/admin/dashboard" });
  }, [isAuthenticated, isAdmin, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      const role = res?.user?.role || (await refresh())?.role;
      if (role === "admin" || role === "super-admin") {
        navigate({ to: "/admin/dashboard" });
      } else {
        toast.error("Access denied. Admin privileges required.");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-ink px-4 text-white">
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <div className="text-xs uppercase tracking-widest text-white/60">Raddazle</div>
            <h1 className="font-display text-2xl font-bold">Admin sign in</h1>
          </div>
        </div>
        <p className="mb-6 text-sm text-white/70">
          Restricted area. Use your administrator credentials.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white/80">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 border-white/20 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-white/80">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 border-white/20 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Lock className="h-4 w-4" /> Sign in
              </>
            )}
          </Button>
        </form>
        <div className="mt-6 flex items-center justify-between text-sm text-white/70">
          <Link to="/admin/forgot-password" className="hover:text-white">
            Forgot password?
          </Link>
          <Link to="/" className="hover:text-white">
            Back to store
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
