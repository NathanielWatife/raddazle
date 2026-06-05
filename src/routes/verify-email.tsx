import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, MailCheck, RefreshCw } from "lucide-react";
import { z } from "zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { authService } from "@/lib/services";
import { useAuthStore } from "@/stores/auth";

const searchSchema = z.object({
  token: z.string().optional().default(""),
  email: z.string().optional().default(""),
});

export const Route = createFileRoute("/verify-email")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [{ title: "Verify email · Raddazle" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { token, email } = useSearch({ from: "/verify-email" });
  const navigate = useNavigate();
  const refresh = useAuthStore((s) => s.refresh);
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle",
  );
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        await api.post("/auth/verify-email", { token, email });
        await refresh();
        setStatus("success");
        toast.success("Email verified!");
        setTimeout(() => navigate({ to: "/" }), 1500);
      } catch {
        setStatus("error");
        toast.error("Verification link is invalid or expired");
      }
    })();
  }, [token, email, navigate, refresh]);

  const onResend = async () => {
    if (!email) return toast.error("No email on file");
    setResending(true);
    try {
      await authService.resendVerification(email);
      toast.success("Verification email sent");
    } catch {
      toast.error("Could not resend email");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle={
        email
          ? `We sent a verification link to ${email}.`
          : "Check your inbox for a verification link."
      }
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Verifying your email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <MailCheck className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-3 font-medium">You're verified! Redirecting…</p>
          </>
        )}
        {(status === "idle" || status === "error") && (
          <>
            <MailCheck className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              {status === "error"
                ? "That link didn't work. Request a new one below."
                : "Didn't get the email? Check spam or resend."}
            </p>
            <Button
              onClick={onResend}
              disabled={resending || !email}
              variant="outline"
              className="mt-4 rounded-full"
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" /> Resend email
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </AuthShell>
  );
}
