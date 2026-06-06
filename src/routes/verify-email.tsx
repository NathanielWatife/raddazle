import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, MailCheck, RefreshCw } from "lucide-react";
import { z } from "zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const { token: urlToken, email } = useSearch({ from: "/verify-email" });
  const navigate = useNavigate();
  const refresh = useAuthStore((s) => s.refresh);
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    urlToken ? "verifying" : "idle",
  );
  const [resending, setResending] = useState(false);

  // OTP manual entry state – 6 boxes
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [submittingOtp, setSubmittingOtp] = useState(false);

  // Auto-verify when token is in the URL (user clicked link in email)
  useEffect(() => {
    if (!urlToken) return;
    (async () => {
      try {
        await api.post("/auth/verify-email", { token: urlToken, email });
        await refresh();
        setStatus("success");
        toast.success("Email verified!");
        setTimeout(() => navigate({ to: "/" }), 1500);
      } catch {
        setStatus("error");
        toast.error("Verification link is invalid or expired");
      }
    })();
  }, [urlToken, email, navigate, refresh]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value.slice(-1); // keep last digit
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const onSubmitOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) return toast.error("Please enter the full 6-digit code");
    if (!email) return toast.error("Email address is missing. Please go back and register again.");
    setSubmittingOtp(true);
    try {
      await api.post("/auth/verify-email", { token: code, email });
      await refresh();
      setStatus("success");
      toast.success("Email verified!");
      setTimeout(() => navigate({ to: "/" }), 1500);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Invalid or expired code";
      toast.error(msg);
    } finally {
      setSubmittingOtp(false);
    }
  };

  const onResend = async () => {
    if (!email) return toast.error("No email on file");
    setResending(true);
    try {
      await authService.resendVerification(email);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
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
          ? `We sent a 6-digit code to ${email}.`
          : "Check your inbox for a verification code."
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
                ? "That link didn't work. Enter the code from your email below."
                : "Enter the 6-digit code from your email, or click the link in the email."}
            </p>

            {/* OTP input boxes */}
            <div className="mt-5 flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <Input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="h-12 w-12 text-center text-xl font-bold tracking-widest"
                />
              ))}
            </div>

            <Button
              onClick={onSubmitOtp}
              disabled={submittingOtp || otp.join("").length < 6}
              className="mt-4 h-10 w-full rounded-full"
            >
              {submittingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify code"}
            </Button>

            <Button
              onClick={onResend}
              disabled={resending || !email}
              variant="outline"
              className="mt-3 w-full rounded-full"
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
