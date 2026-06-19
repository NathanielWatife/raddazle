import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { paymentService } from "@/lib/services";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment/callback")({
  head: () => ({
    meta: [
      { title: "Payment Callback · Raddazle" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentCallbackPage,
});

interface SearchParams {
  reference?: string;
  orderId?: string;
}

function PaymentCallbackPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: Route.id }) as SearchParams;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!search.reference) {
          setStatus("error");
          setMessage("No payment reference provided");
          return;
        }

        // Call the verification endpoint
        const result = await paymentService.verifyPaystack(search.reference, search.orderId || "");

        if (result.verified) {
          setStatus("success");
          setMessage("Payment verified successfully!");
          toast.success("Payment successful! Redirecting to your orders...");

          // Redirect to orders page after a short delay
          setTimeout(() => {
            navigate({ to: "/orders" });
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Payment verification failed");
          toast.error("Payment verification failed");
        }
      } catch (error: unknown) {
        console.error("Payment verification error:", error);
        setStatus("error");
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === "object" && error !== null && "message" in error
              ? (error.message as string)
              : "Failed to verify payment";
        setMessage(errorMessage || "An error occurred during verification");
        toast.error(errorMessage || "Failed to verify payment");
      }
    };

    verifyPayment();
  }, [search.reference, search.orderId, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        {status === "loading" && (
          <>
            <div className="mb-6 flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Verifying payment...</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while we confirm your payment with Paystack.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-6 flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-600">Payment Successful!</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              Redirecting you to your orders...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-6 flex justify-center">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-destructive">Payment Failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <div className="mt-6 flex flex-col gap-3">
              <Button
                onClick={() => navigate({ to: "/orders" })}
                className="rounded-full"
              >
                Go to Orders
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/checkout" })}
                className="rounded-full"
              >
                Try Again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
