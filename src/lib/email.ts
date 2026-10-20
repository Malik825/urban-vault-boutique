// ─── Transactional Email Engine (Urban Vault Unisex Boutique) ─────────────────
// Zero-cost integration: Powered by Resend's free tier (3,000 free emails/month).
// Gracefully logs to server console if RESEND_API_KEY is not yet configured.

import { STORE, formatPrice } from "@/lib/store-data";

export interface OrderEmailItem {
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  size?: string;
}

export interface OrderEmailPayload {
  orderNumber: string;
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  deliveryMethod: "delivery" | "pickup";
  address: string;
  city: string;
  region: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference?: string | null;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  items: OrderEmailItem[];
  notes?: string | null;
}

/**
 * Generates an editorial, high-fashion order receipt email template
 */
export function generateOrderConfirmationHtml(payload: OrderEmailPayload): string {
  const itemsHtml = payload.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #27272a;">
        <td style="padding: 14px 0; vertical-align: top;">
          <div style="font-weight: 700; color: #ffffff; font-size: 14px;">${item.name}</div>
          ${item.size ? `<div style="font-size: 12px; color: #a1a1aa; margin-top: 2px;">Size: <span style="color: #ffffff;">${item.size}</span></div>` : ""}
          <div style="font-size: 12px; color: #71717a; margin-top: 2px;">Qty: ${item.quantity} &times; ${formatPrice(item.unitPrice)}</div>
        </td>
        <td style="padding: 14px 0; text-align: right; vertical-align: top; font-weight: 700; color: #ffffff; font-size: 14px;">
          ${formatPrice(item.unitPrice * item.quantity)}
        </td>
      </tr>
    `
    )
    .join("");

  const isPickup = payload.deliveryMethod === "pickup";
  const isPaid = payload.paymentStatus === "paid";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${payload.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #121215; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; text-align: left;" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 32px 36px; border-bottom: 1px solid #27272a;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #10b981; font-weight: 800; margin-bottom: 6px;">
                      URBAN VAULT · ACCRA
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">
                      ORDER CONFIRMED
                    </h1>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <div style="font-family: monospace; font-size: 12px; background-color: #18181b; border: 1px solid #27272a; padding: 6px 12px; border-radius: 8px; color: #ffffff; display: inline-block;">
                      ${payload.orderNumber}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome message -->
          <tr>
            <td style="padding: 32px 36px 20px 36px;">
              <p style="margin: 0 0 12px 0; font-size: 16px; color: #ffffff; font-weight: 600;">
                Hello ${payload.customerName},
              </p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                Thank you for your order. We are preparing your curated boutique pieces. Below is your complete order receipt and delivery summary.
              </p>
            </td>
          </tr>

          <!-- Payment & Status Banner -->
          <tr>
            <td style="padding: 0 36px 24px 36px;">
              <table width="100%" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 0 12px 0 0;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a;">Payment Status</div>
                    <div style="font-size: 14px; font-weight: 700; color: ${isPaid ? "#10b981" : "#f59e0b"}; margin-top: 2px;">
                      ${isPaid ? "✓ Paid via Paystack" : "Pending Payment (Cash on Delivery / MoMo)"}
                    </div>
                  </td>
                  <td align="right">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a;">Total Paid</div>
                    <div style="font-size: 18px; font-weight: 900; color: #ffffff; margin-top: 2px;">
                      ${formatPrice(payload.total)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 36px;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #71717a; margin-bottom: 8px;">
                Items in Your Drop
              </div>
              <table width="100%" cellspacing="0" cellpadding="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Order Breakdown -->
          <tr>
            <td style="padding: 20px 36px 28px 36px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #a1a1aa;">
                <tr>
                  <td style="padding: 4px 0;">Subtotal</td>
                  <td align="right" style="color: #ffffff;">${formatPrice(payload.subtotal)}</td>
                </tr>
                ${
                  payload.discount > 0
                    ? `<tr>
                  <td style="padding: 4px 0; color: #10b981;">VIP Discount</td>
                  <td align="right" style="color: #10b981;">-${formatPrice(payload.discount)}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 4px 0;">${isPickup ? "Showroom Pickup" : "Delivery Fee"}</td>
                  <td align="right" style="color: #ffffff;">${payload.shippingFee === 0 ? "FREE" : formatPrice(payload.shippingFee)}</td>
                </tr>
                <tr style="border-top: 1px solid #27272a;">
                  <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 800; color: #ffffff;">Total</td>
                  <td align="right" style="padding: 12px 0 0 0; font-size: 18px; font-weight: 900; color: #10b981;">
                    ${formatPrice(payload.total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fulfillment / Address Section -->
          <tr>
            <td style="padding: 0 36px 32px 36px;">
              <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px;">
                <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #10b981; margin-bottom: 8px;">
                  ${isPickup ? "📍 Showroom Pickup Location" : "🚚 Shipping Destination"}
                </div>
                <div style="font-size: 14px; font-weight: 700; color: #ffffff;">
                  ${payload.address}
                </div>
                <div style="font-size: 13px; color: #a1a1aa; margin-top: 4px;">
                  ${payload.city}, ${payload.region}
                </div>
                <div style="font-size: 12px; color: #71717a; margin-top: 8px;">
                  Recipient Phone: <strong style="color: #ffffff;">${payload.phone}</strong>
                </div>
                ${
                  isPickup
                    ? `<div style="margin-top: 10px; font-size: 12px; color: #e4e4e7; background-color: #27272a; padding: 10px; border-radius: 8px;">
                    Hours: Mon–Sat 9:30 AM – 7:30 PM. Please present order #${payload.orderNumber} upon pickup.
                  </div>`
                    : ""
                }
              </div>
            </td>
          </tr>

          <!-- WhatsApp Concierge Support -->
          <tr>
            <td style="background-color: #09090b; padding: 24px 36px; border-top: 1px solid #27272a; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #a1a1aa;">
                Have questions about your order or need instant assistance?
              </p>
              <a href="https://wa.me/${STORE.whatsappRaw}?text=${encodeURIComponent(
    `Hello Urban Vault! I have an enquiry regarding order #${payload.orderNumber}`
  )}" style="display: inline-block; background-color: #10b981; color: #000000; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 24px; border-radius: 9999px;">
                Chat on WhatsApp (${STORE.phone})
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; font-size: 11px; color: #52525b; text-align: center;">
              ${STORE.name} &bull; ${STORE.address} &bull; ${STORE.email}
              <br />
              &copy; ${new Date().getFullYear()} Urban Vault. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generates an internal admin dispatch alert email
 */
export function generateAdminOrderAlertHtml(payload: OrderEmailPayload): string {
  const itemsList = payload.items
    .map((item) => `• ${item.quantity}x ${item.name} ${item.size ? `(Size: ${item.size})` : ""} - ${formatPrice(item.unitPrice * item.quantity)}`)
    .join("<br />");

  return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #f4f4f5; padding: 24px; color: #18181b;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid #e4e4e7;">
    <h2 style="margin-top: 0; color: #09090b;">🚨 New Boutique Order: ${payload.orderNumber}</h2>
    <p><strong>Customer:</strong> ${payload.customerName} (${payload.phone})</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    <p><strong>Method:</strong> ${payload.deliveryMethod.toUpperCase()} (${payload.city}, ${payload.region})</p>
    <p><strong>Address:</strong> ${payload.address}</p>
    <p><strong>Payment Method:</strong> ${payload.paymentMethod} (${payload.paymentStatus.toUpperCase()})</p>
    <p><strong>Total:</strong> ${formatPrice(payload.total)}</p>
    
    <div style="margin: 20px 0; padding: 14px; background: #f4f4f5; border-radius: 8px;">
      <h4 style="margin: 0 0 8px 0;">Items to Pack:</h4>
      ${itemsList}
    </div>

    ${payload.notes ? `<p><strong>Customer Notes:</strong> ${payload.notes}</p>` : ""}

    <div style="margin-top: 24px;">
      <a href="https://urbanvault.store/dashboard/orders" style="background: #09090b; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: bold; display: inline-block;">
        View in Admin Dashboard &rarr;
      </a>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Sends both customer confirmation and admin notification emails
 */
export async function sendOrderEmails(payload: OrderEmailPayload): Promise<{
  customerSent: boolean;
  adminSent: boolean;
  provider: "resend" | "console";
}> {
  const resendApiKey =
    process.env["RESEND_API_KEY"] ||
    process.env["VITE_RESEND_API_KEY"] ||
    "";

  const adminEmail = process.env["ADMIN_NOTIFICATION_EMAIL"] || STORE.email || "orders@urbanvaultgh.com";
  const fromEmail = process.env["FROM_EMAIL"] || "Urban Vault <orders@urbanvault.store>";

  // Fallback: If no RESEND_API_KEY is configured, log for development / zero-cost testing
  if (!resendApiKey) {
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log(`[TRANSACTIONAL EMAIL ENGINE] (Dev Simulation — set RESEND_API_KEY to send live)`);
    console.log(`To Customer: ${payload.email}`);
    console.log(`Subject: Your Urban Vault Order Confirmation [${payload.orderNumber}]`);
    console.log(`To Admin: ${adminEmail}`);
    console.log(`Total: ${formatPrice(payload.total)} | Items: ${payload.items.length}`);
    console.log("═══════════════════════════════════════════════════════════════════");
    return { customerSent: true, adminSent: true, provider: "console" };
  }

  // Live dispatch via Resend REST API (zero extra dependencies needed)
  try {
    const customerHtml = generateOrderConfirmationHtml(payload);
    const adminHtml = generateAdminOrderAlertHtml(payload);

    // 1. Send Customer Email
    const custRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: payload.email,
        subject: `Order Confirmed: ${payload.orderNumber} — Urban Vault Unisex Boutique`,
        html: customerHtml,
      }),
    });

    // 2. Send Admin Alert Email
    const adminRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: adminEmail,
        subject: `[New Order] ${payload.orderNumber} - ${payload.customerName} (${formatPrice(payload.total)})`,
        html: adminHtml,
      }),
    });

    return {
      customerSent: custRes.ok,
      adminSent: adminRes.ok,
      provider: "resend",
    };
  } catch (error) {
    console.error("[sendOrderEmails] Error dispatching emails:", error);
    return { customerSent: false, adminSent: false, provider: "resend" };
  }
}
