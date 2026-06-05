import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service · Raddazle" },
      {
        name: "description",
        content: "The rules and terms that govern your use of Raddazle.",
      },
    ],
  }),
  component: () => (
    <LegalPage
      title="Terms of Service"
      updated="June 2026"
      sections={[
        {
          h: "Acceptance of terms",
          p: "By accessing or using Raddazle, you agree to be bound by these Terms of Service. If you don't agree, please don't use the service.",
        },
        {
          h: "Account responsibilities",
          p: "You're responsible for keeping your account credentials secure and for all activity that happens under your account. Notify us immediately of any unauthorized use.",
        },
        {
          h: "Orders and payments",
          p: "All orders are subject to product availability and our acceptance. Prices are listed in Nigerian Naira and may change without notice. Payment must be completed before shipment (except for verified Cash on Delivery orders).",
        },
        {
          h: "Product authenticity",
          p: "We guarantee 100% authentic products. If you ever receive a product proven to be inauthentic, contact us within 7 days for a full refund.",
        },
        {
          h: "Returns and refunds",
          p: "Refer to our Return Policy for full details. Unopened items can be returned within 7 days of delivery.",
        },
        {
          h: "Prohibited use",
          p: "You may not use Raddazle for unlawful purposes, to attempt to gain unauthorized access to our systems, or to disrupt service for other users.",
        },
        {
          h: "Limitation of liability",
          p: "Raddazle's liability is limited to the amount you paid for the relevant order. We're not liable for indirect or consequential damages.",
        },
        {
          h: "Changes to terms",
          p: "We may update these terms occasionally. Continued use after changes constitutes acceptance of the updated terms.",
        },
        {
          h: "Contact",
          p: "Questions about these terms? Email legal@raddazle.com.",
        },
      ]}
    />
  ),
});
