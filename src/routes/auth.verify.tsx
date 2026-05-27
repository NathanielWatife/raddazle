import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export const Route = createFileRoute("/auth/verify")({
  head: () => ({ meta: [{ title: "Verify Email — SOUVENIR" }] }),
  component: Verify,
});

function Verify() {
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const otp = formData.get("otp");
    
    if (otp?.toString().length !== 6) {
      toast.error("Please enter a 6-digit code.");
      return;
    }

    toast.success("Verification successful.");
    navigate({ to: "/dashboard" });
  };

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Security</p>
      <h1 className="mt-3 font-serif text-5xl">Verify account.</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        We've sent a 6-digit code to your email. Please enter it below to verify your account.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-8">
        <div className="flex justify-center">
          <InputOTP maxLength={6} name="otp">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button className="w-full bg-foreground text-background py-3.5 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground/90">
          Verify code
        </button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4 text-sm text-muted-foreground">
        <p>
          Didn't receive a code?{" "}
          <button
            type="button"
            className="text-foreground hover:underline"
            onClick={() => toast.success("Code resent to your email.")}
          >
            Resend
          </button>
        </p>
        <Link to="/auth/login" className="link-underline mt-4">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
