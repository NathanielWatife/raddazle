import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/services";

export const Route = createFileRoute("/admin/forgot-password")({
  component: AdminForgotPage,
});

function AdminForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res?.message || "Reset email sent");
      setSent(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Unable to send reset email.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <h1 className="font-display text-2xl font-bold">Admin password reset</h1>
        <p className="mt-1 text-sm text-white/70">
          {sent
            ? "Check your email for the reset code and link."
            : "Enter your admin email to receive a reset code."}
        </p>
        {sent ? (
          <div className="mt-6 rounded-2xl border border-success/30 bg-success/10 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
            <p className="mt-2 text-sm">
              Sent to <strong>{email}</strong>
            </p>
            <Link to="/admin/reset-password" className="mt-4 inline-block">
              <Button className="w-full">Enter reset code</Button>
            </Link>
            <button
              onClick={() => setSent(false)}
              className="mt-2 text-xs text-white/60 hover:text-white"
            >
              Send another email
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="h-4 w-4" /> Send reset code
                </>
              )}
            </Button>
          </form>
        )}
        <div className="mt-6 text-center text-sm">
          <Link to="/admin/login" className="text-white/70 hover:text-white">
            ← Back to admin login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
