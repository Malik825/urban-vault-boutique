import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Check, Send, Smartphone, Monitor } from "lucide-react";
import { toast } from "sonner";

import {
  generateOrderConfirmationHtml,
  generateAdminOrderAlertHtml,
  generateOrderStatusUpdateHtml,
  type OrderEmailPayload,
} from "@/lib/email";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/preview-email")({
  head: () => ({
    meta: [
      { title: "Email Template Preview — Urban Vault" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EmailPreviewPage,
});

const SAMPLE_ORDER: OrderEmailPayload = {
  orderNumber: "UV-261020-8492",
  orderId: "sample-order-uuid-1234",
  customerName: "Kofi Mensah",
  email: "kofi.mensah@example.com",
  phone: "+233 50 123 4567",
  deliveryMethod: "delivery",
  address: "House 14, Ring Road Central, Osu",
  city: "Accra",
  region: "Greater Accra",
  paymentMethod: "Paystack (MTN Mobile Money)",
  paymentStatus: "paid",
  paymentReference: "T6382910481",
  subtotal: 980,
  discount: 98,
  shippingFee: 35,
  total: 917,
  createdAt: "20 Oct 2026",
  items: [
    {
      name: "Urban Heavyweight Boxy Tee - Vintage Washed Onyx",
      quantity: 1,
      unitPrice: 380,
      size: "XL",
      image: "/boutique/urban_vault_hero_1_1792394728170.jpg",
    },
    {
      name: "Retro High-Top Streetwear Kicks - Monochrome Edition",
      quantity: 1,
      unitPrice: 600,
      size: "EU 43",
      image: "/boutique/urban_vault_hero_3_1792394763146.jpg",
    },
  ],
  notes: "Please call when courier arrives at the gate.",
};

function EmailPreviewPage() {
  const [template, setTemplate] = useState<"customer" | "admin" | "status">("customer");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [statusType, setStatusType] = useState<"shipped" | "ready_for_pickup" | "delivered">("shipped");

  const getHtml = () => {
    if (template === "customer") {
      return generateOrderConfirmationHtml(SAMPLE_ORDER);
    }
    if (template === "admin") {
      return generateAdminOrderAlertHtml(SAMPLE_ORDER);
    }
    return generateOrderStatusUpdateHtml({
      orderNumber: SAMPLE_ORDER.orderNumber,
      customerName: SAMPLE_ORDER.customerName,
      status: statusType,
      trackingNote: "Package handed over to Speedaf Express Courier. Tracking ID: SPGH-92819",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Controller Bar */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Urban Vault &bull; Email Template Showcase
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              Live Responsive HTML Previews for Resend
            </p>
          </div>
        </div>

        {/* Template Switcher */}
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
          <button
            onClick={() => setTemplate("customer")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              template === "customer"
                ? "bg-emerald-500 text-neutral-950 shadow-xs"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Customer Receipt
          </button>
          <button
            onClick={() => setTemplate("admin")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              template === "admin"
                ? "bg-emerald-500 text-neutral-950 shadow-xs"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Admin Packing Alert
          </button>
          <button
            onClick={() => setTemplate("status")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              template === "status"
                ? "bg-emerald-500 text-neutral-950 shadow-xs"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Status Updates
          </button>
        </div>

        {/* Sub-toggles for status and device */}
        <div className="flex items-center gap-3">
          {template === "status" && (
            <select
              value={statusType}
              onChange={(e) => setStatusType(e.target.value as any)}
              className="bg-neutral-900 border border-neutral-800 text-xs rounded-lg px-2.5 py-1.5 text-neutral-200"
            >
              <option value="shipped">Dispatched / Shipped</option>
              <option value="ready_for_pickup">Ready for Showroom Pickup</option>
              <option value="delivered">Delivered</option>
            </select>
          )}

          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded ${device === "desktop" ? "bg-neutral-800 text-white" : "text-neutral-500"}`}
              title="Desktop View"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded ${device === "mobile" ? "bg-neutral-800 text-white" : "text-neutral-500"}`}
              title="Mobile View"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Frame Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-neutral-950">
        <div
          className={`transition-all duration-300 w-full overflow-hidden rounded-2xl shadow-2xl border border-neutral-800 bg-black ${
            device === "mobile" ? "max-w-[390px] h-[800px]" : "max-w-[700px] h-[860px]"
          }`}
        >
          <iframe
            title="Email Template Render"
            srcDoc={getHtml()}
            className="w-full h-full border-0 bg-black"
          />
        </div>
      </main>
    </div>
  );
}
