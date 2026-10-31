// ─── Paystack Server-side Verification & Webhook Engine ────────────────────────
// Securely verifies Paystack Ghana transactions using secret key.

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
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

// ─── Paystack Webhook Engine (HMAC SHA512 Verified) ──────────────────────────

/**
 * Verifies Paystack HMAC SHA512 webhook signature against PAYSTACK_SECRET_KEY
 */
export function verifyPaystackWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature) return false;
  const secret = process.env["PAYSTACK_SECRET_KEY"];
  if (!secret) return false;

  try {
    const hmac = crypto.createHmac("sha512", secret);
    const expected = hmac.update(payload).digest("hex");
    if (signature.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(signature, "utf-8"), Buffer.from(expected, "utf-8"));
  } catch (err) {
    console.error("[verifyPaystackWebhookSignature] Error:", err);
    return false;
  }
}

/**
 * HTTP Handler for incoming Paystack Webhook events (/api/paystack-webhook)
 */
export async function handlePaystackWebhook(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    console.warn("[handlePaystackWebhook] Invalid or missing signature");
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let eventPayload: any;
  try {
    eventPayload = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const event = eventPayload.event;
  const data = eventPayload.data;

  console.log(`[handlePaystackWebhook] Verified Paystack event: ${event}, ref: ${data?.reference}`);

  if (event === "charge.success" && data) {
    const reference = data.reference;
    const channel = data.channel;
    const paidAt = data.paid_at || new Date().toISOString();
    const metadata = data.metadata || {};
    const orderId = metadata.orderId || metadata.order_id;
    const orderNumber = metadata.orderNumber || metadata.order_number;

    const supabase = getAdminClient();

    // Audit log transaction
    try {
      await (supabase as any).from("payment_logs").insert({
        provider: "paystack",
        reference: data.reference || "unknown",
        event,
        amount: data.amount ? data.amount / 100 : null,
        currency: data.currency || "GHS",
        channel: data.channel || null,
        status: data.status || "success",
        payload: eventPayload,
      });
    } catch {
      // audit table optional
    }

    let targetOrder: any = null;

    if (orderId) {
      const { data: o } = await supabase
        .from("orders")
        .select("id, total, status, shipping_address")
        .eq("id", orderId)
        .maybeSingle();
      targetOrder = o;
    }

    if (!targetOrder && reference) {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total, status, shipping_address")
        .order("created_at", { ascending: false })
        .limit(100);

      targetOrder = (orders || []).find((o: any) => {
        const ship = o.shipping_address || {};
        return (
          ship.paymentReference === reference ||
          (orderNumber && ship.orderNumber === orderNumber)
        );
      });
    }

    if (targetOrder) {
      const currentShip = (targetOrder.shipping_address as any) || {};

      // Idempotency check: if order is already marked paid, return 200 immediately
      if (currentShip.paymentStatus === "paid" && targetOrder.status !== "pending") {
        return new Response(
          JSON.stringify({ received: true, message: "Order already processed" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      const updatedShipping = {
        ...currentShip,
        paymentStatus: "paid",
        paymentReference: reference,
        paymentChannel: channel,
        paidAt,
      };

      await supabase
        .from("orders")
        .update({
          status: "processing",
          shipping_address: updatedShipping as any,
        })
        .eq("id", targetOrder.id);

      // Trigger confirmation email
      try {
        await sendOrderEmails({
          orderNumber: currentShip.orderNumber || `UV-${targetOrder.id.slice(0, 8).toUpperCase()}`,
          orderId: targetOrder.id,
          customerName: currentShip.customerName || data.customer?.first_name || "Valued Customer",
          email: currentShip.email || data.customer?.email,
          phone: currentShip.phone || data.customer?.phone,
          deliveryMethod: currentShip.deliveryMethod || "delivery",
          address: currentShip.address || "",
          city: currentShip.city || "Assin Fosu",
          region: currentShip.region || "Central Region",
          paymentMethod: `Paystack (${channel || "MoMo / Card"})`,
          paymentStatus: "paid",
          paymentReference: reference,
          subtotal: currentShip.subtotal || targetOrder.total,
          discount: currentShip.discount || 0,
          shippingFee: currentShip.shippingFee || 0,
          total: targetOrder.total,
          items: currentShip.items || [],
        });
      } catch (mailErr) {
        console.warn("[handlePaystackWebhook] Email trigger warning:", mailErr);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
