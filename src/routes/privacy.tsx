import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy · Raddazle" },
      {
        name: "description",
        content: "How Raddazle collects, uses, and protects your personal information.",
      },
    ],
  }),
  component: () => (
    <LegalPage
      title="Privacy Policy"
      updated="June 2026"
      sections={[
        {
          h: "Information we collect",
          p: "We collect information you provide when creating an account, placing an order, or contacting us — including your name, email, phone number, shipping address, and payment details. We also collect usage data (pages visited, products viewed) to improve the experience.",
        },
        {
          h: "How we use your information",
          p: "To process and deliver your orders, communicate with you about purchases, send marketing communications (with your consent), prevent fraud, and improve our products and services.",
        },
        {
          h: "Sharing your information",
          p: "We never sell your data. We share information only with trusted partners that help us run the business — payment processors (Paystack, Flutterwave), shipping carriers, and analytics providers — all bound by strict confidentiality agreements.",
        },
        {
          h: "Cookies",
          p: "We use cookies to keep you signed in, remember your cart, and understand how the site is used. You can disable cookies in your browser, but some features may not work correctly.",
        },
        {
          h: "Data security",
          p: "Your data is encrypted in transit (HTTPS) and at rest. Payment information is handled by PCI-DSS compliant processors and never stored on our servers.",
        },
        {
          h: "Your rights",
          p: "You can request access to, correction of, or deletion of your personal data at any time by emailing privacy@raddazle.com.",
        },
        {
          h: "Contact",
          p: "Questions about this policy? Email privacy@raddazle.com.",
        },
      ]}
    />
  ),
});
