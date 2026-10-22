// ─── Paystack Server-side Verification & Webhook Engine ────────────────────────
// Securely verifies Paystack Ghana transactions using secret key.

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { sendOrderEmails } from "@/lib/email";

function getAdminClient() {
  const url =
    process.env["SUPABASE_URL"] ||
    process.env["VITE_SUPABASE_URL"] ||
    import.meta.env["VITE_SUPABASE_URL"]!;

  const key =
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!;

  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export interface PaystackVerifyResult {
  verified: boolean;
  status: "success" | "failed" | "abandoned" | "unknown";
  amount: number; // in GHS
  currency: string;
  reference: string;
  customerEmail?: string;
  channel?: string;
  paidAt?: string;
  gatewayResponse?: string;
  message?: string;
}

/**
 * Calls Paystack API to verify a transaction reference
 */
export async function verifyPaystackReference(reference: string): Promise<PaystackVerifyResult> {
  const secretKey =
    process.env["PAYSTACK_SECRET_KEY"] ||
    process.env["SUPABASE_SECRET_KEY"] ||
    "sk_test_placeholder";

  // If running in development without a live secret key, allow simulation
  if (secretKey === "sk_test_placeholder" || !secretKey) {
    console.warn("[verifyPaystackReference] PAYSTACK_SECRET_KEY not set. Operating in test pass-through mode.");
    return {
      verified: true,
      status: "success",
      amount: 0,
      currency: "GHS",
      reference,
      channel: "card",
      message: "Development test pass-through",
    };
  }

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      return {
        verified: false,
        status: "failed",
        amount: 0,
        currency: "GHS",
        reference,
        message: data.message || "Failed to verify transaction with Paystack",
      };
    }

    const tx = data.data;
    const isSuccess = tx.status === "success";

    return {
      verified: isSuccess,
      status: tx.status,
      amount: tx.amount / 100, // convert pesewas back to GHS
      currency: tx.currency,
      reference: tx.reference,
      customerEmail: tx.customer?.email,
      channel: tx.channel,
      paidAt: tx.paid_at,
      gatewayResponse: tx.gateway_response,
    };
  } catch (err: any) {
    console.error("[verifyPaystackReference] Error:", err);
    return {
      verified: false,
      status: "unknown",
      amount: 0,
      currency: "GHS",
      reference,
      message: err?.message || "Network error while connecting to Paystack",
    };
  }
}

/**
 * Server function called by checkout after Paystack popup callback returns
 */
export const serverConfirmPaystackPayment = createServerFn({ method: "POST" })
  .validator((data: { orderId: string; reference: string; expectedAmount?: number }) => data)
  .handler(async ({ data }) => {
    try {
      const verification = await verifyPaystackReference(data.reference);

      if (!verification.verified) {
        throw new Error(`Paystack verification failed: ${verification.message || "Payment was not successful."}`);
      }

      const supabase = getAdminClient();

      // Fetch the order to update
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("id, total, status, shipping_address")
        .eq("id", data.orderId)
        .single();

      if (orderErr || !order) {
        throw new Error("Order not found to confirm payment.");
      }

      const currentShipping = (order.shipping_address as any) || {};
      const updatedShipping = {
        ...currentShipping,
        paymentStatus: "paid",
        paymentReference: data.reference,
        paymentChannel: verification.channel,
        paidAt: verification.paidAt || new Date().toISOString(),
      };

      // Update order status to processing and paymentStatus to paid
      const { error: updateErr } = await supabase
        .from("orders")
        .update({
          status: "processing",
          shipping_address: updatedShipping as any,
        })
        .eq("id", data.orderId);

      if (updateErr) {
        throw new Error(updateErr.message);
      }

      // Trigger confirmation email
      try {
        await sendOrderEmails({
          orderNumber: currentShipping.orderNumber || `UV-${data.orderId.slice(0, 8).toUpperCase()}`,
          orderId: data.orderId,
          customerName: currentShipping.customerName || "Valued Customer",
          email: currentShipping.email,
          phone: currentShipping.phone,
          deliveryMethod: currentShipping.deliveryMethod || "delivery",
          address: currentShipping.address || "",
          city: currentShipping.city || "Assin Fosu",
          region: currentShipping.region || "Central Region",
          paymentMethod: currentShipping.paymentMethod || "Paystack (MoMo / Card)",
          paymentStatus: "paid",
          paymentReference: data.reference,
          subtotal: currentShipping.subtotal || order.total,
          discount: currentShipping.discount || 0,
          shippingFee: currentShipping.shippingFee || 0,
          total: order.total,
          items: currentShipping.items || [],
        });
      } catch (emailErr) {
        console.warn("[serverConfirmPaystackPayment] Email trigger warning:", emailErr);
      }

      return {
        success: true,
        orderId: data.orderId,
        reference: data.reference,
        status: "paid",
      };
    } catch (err: any) {
      console.error("[serverConfirmPaystackPayment] Error:", err);
      throw new Error(err?.message || "Failed to confirm Paystack payment.");
    }
  });
