// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This code runs on Supabase Edge Functions (Deno runtime).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Validates Paystack HMAC SHA512 signature using Web Crypto API
 */
async function verifyPaystackSignature(
  body: string,
  signature: string | null,
  secretKey: string,
): Promise<boolean> {
  if (!signature || !secretKey) return false;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"],
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const hashHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex === signature;
  } catch (err) {
    console.error("[verifyPaystackSignature] Error:", err);
    return false;
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  const secretKey = Deno.env.get("PAYSTACK_SECRET_KEY") || "";

  // 1. Verify HMAC SHA512 authenticity
  const isValid = await verifyPaystackSignature(rawBody, signature, secretKey);
  if (!isValid) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const event = payload.event;
  const data = payload.data;

  // 2. Initialize Supabase Admin Client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 3. Financial audit logging
  try {
    await supabase.from("payment_logs").insert({
      provider: "paystack",
      reference: data?.reference || "unknown",
      event: event || "unknown",
      amount: data?.amount ? data.amount / 100 : null,
      currency: data?.currency || "GHS",
      channel: data?.channel || null,
      status: data?.status || "success",
      payload,
    });
  } catch (e) {
    console.warn("[paystack-webhook] Payment log insert warning:", e);
  }

  // 4. Handle successful charge
  if (event === "charge.success" && data) {
    const reference = data.reference;
    const metadata = data.metadata || {};
    const orderId = metadata.orderId || metadata.order_id;
    const orderNumber = metadata.orderNumber || metadata.order_number;

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
      const currentShip = targetOrder.shipping_address || {};

      // Idempotency: Skip if already marked paid
      if (currentShip.paymentStatus !== "paid") {
        const updatedShipping = {
          ...currentShip,
          paymentStatus: "paid",
          paymentReference: reference,
          paymentChannel: data.channel,
          paidAt: data.paid_at || new Date().toISOString(),
        };

        await supabase
          .from("orders")
          .update({
            status: "processing",
            shipping_address: updatedShipping,
          })
          .eq("id", targetOrder.id);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
