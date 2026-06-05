import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";

export const Route = createFileRoute("/return")({
  head: () => ({
    meta: [
      { title: "Return Policy · Raddazle" },
      {
        name: "description",
        content: "Our 7-day return policy and how to start a return at Raddazle.",
      },
    ],
  }),
  component: () => (
    <LegalPage
      title="Return Policy"
      updated="June 2026"
      sections={[
        {
          h: "7-day return window",
          p: "You have 7 days from the date of delivery to request a return. Items must be unopened, unused, and in their original packaging with all seals intact.",
        },
        {
          h: "Non-returnable items",
          p: "For hygiene reasons, opened fragrances, personal care, and intimate items cannot be returned unless they arrived damaged or defective.",
        },
        {
          h: "How to start a return",
          p: "Email returns@raddazle.com with your order number and reason for return. We'll respond within 24 hours with shipping instructions.",
        },
        {
          h: "Return shipping",
          p: "Customers are responsible for return shipping costs unless the return is due to our error (wrong item shipped, damaged in transit, or defective product).",
        },
        {
          h: "Refunds",
          p: "Once we receive and inspect your return, refunds are processed within 5–10 business days to your original payment method. Bank transfer refunds may take an additional 2–3 days to reflect.",
        },
        {
          h: "Exchanges",
          p: "We don't do direct exchanges. Return the original item for a refund and place a new order for the replacement.",
        },
        {
          h: "Damaged or wrong items",
          p: "If your order arrives damaged or you received the wrong product, take photos and contact us within 48 hours of delivery. We'll arrange a replacement or full refund at no cost to you.",
        },
      ]}
    />
  ),
});
