import { createServerFn } from "@tanstack/react-start";
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
  createdAt?: string;
}

/**
 * High-end Luxury Streetwear Customer Order Confirmation Template
 */
export function generateOrderConfirmationHtml(payload: OrderEmailPayload): string {
  const isPickup = payload.deliveryMethod === "pickup";
  const isPaid = payload.paymentStatus === "paid";
  const formattedDate = payload.createdAt || new Date().toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const itemsHtml = payload.items
    .map((item) => {
      const itemTotal = item.unitPrice * item.quantity;
      const imageUrl = item.image && item.image.startsWith("http") 
        ? item.image 
        : item.image 
        ? `${STORE.siteUrl}${item.image}`
        : `${STORE.siteUrl}/boutique/urban_vault_hero_1_1792394728170.jpg`;

      return `
        <tr style="border-bottom: 1px solid #1f1f23;">
          <td style="padding: 16px 0; vertical-align: middle; width: 72px;">
            <img src="${imageUrl}" alt="${item.name}" width="64" height="64" style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px; border: 1px solid #27272a; background-color: #18181b; display: block;" />
          </td>
          <td style="padding: 16px 16px; vertical-align: middle;">
            <div style="font-weight: 700; color: #ffffff; font-size: 14px; line-height: 1.3;">
              ${item.name}
            </div>
            <div style="margin-top: 4px; font-size: 12px; color: #a1a1aa; font-family: monospace;">
              ${item.size ? `<span style="background-color: #27272a; color: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-right: 6px;">SIZE: ${item.size}</span>` : ""}
              <span>QTY: ${item.quantity}</span> &bull; <span>${formatPrice(item.unitPrice)}</span>
            </div>
          </td>
          <td style="padding: 16px 0; text-align: right; vertical-align: middle; width: 90px;">
            <div style="font-weight: 800; color: #ffffff; font-size: 14px; font-family: -apple-system, sans-serif;">
              ${formatPrice(itemTotal)}
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  const trackingUrl = `${STORE.siteUrl}/account`;
  const whatsappUrl = `https://wa.me/${STORE.whatsappRaw}?text=${encodeURIComponent(
    `Hello Urban Vault! I have an enquiry regarding my order #${payload.orderNumber}`
  )}`;

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Order Confirmed — ${payload.orderNumber}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #050507; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #e4e4e7;">
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #050507; padding: 32px 12px;">
    <tr>
      <td align="center">
        
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0c0c0e; border: 1px solid #1f1f23; border-radius: 16px; overflow: hidden; text-align: left;" cellspacing="0" cellpadding="0">
          
          <!-- Editorial Top Brand Banner -->
          <tr>
            <td style="background-color: #000000; padding: 28px 36px; border-bottom: 1px solid #1f1f23;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 18px; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase; color: #ffffff;">
                      URBAN VAULT
                    </div>
                    <div style="font-size: 10px; font-family: monospace; letter-spacing: 0.18em; text-transform: uppercase; color: #f43f5e; margin-top: 3px; font-weight: 600;">
                      UNISEX BOUTIQUE &bull; ASSIN FOSU, GHANA
                    </div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <div style="display: inline-block; background-color: #121215; border: 1px solid #27272a; padding: 6px 12px; border-radius: 9999px;">
                      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #f43f5e; margin-right: 6px; vertical-align: middle;"></span>
                      <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #ffffff; vertical-align: middle;">${payload.orderNumber}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Confirmation Message -->
          <tr>
            <td style="padding: 36px 36px 24px 36px;">
              <div style="font-family: monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #f43f5e; margin-bottom: 8px;">
                ORDER CONFIRMED // DROP ARCHIVE
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em; line-height: 1.2;">
                Thank You, ${payload.customerName}.
              </h1>
              <p style="margin: 12px 0 0 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                Your boutique pieces have been secured and are now being packaged by our styling team in Assin Fosu. Below is your official receipt.
              </p>
            </td>
          </tr>

          <!-- Order Summary Pill Header -->
          <tr>
            <td style="padding: 0 36px 28px 36px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #141418; border: 1px solid #27272a; border-radius: 12px; padding: 16px 20px;">
                <tr>
                  <td style="padding: 4px 12px 4px 0; border-right: 1px solid #27272a;">
                    <div style="font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.12em; color: #71717a;">DATE</div>
                    <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-top: 2px;">${formattedDate}</div>
                  </td>
                  <td style="padding: 4px 12px; border-right: 1px solid #27272a;">
                    <div style="font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.12em; color: #71717a;">PAYMENT</div>
                    <div style="font-size: 13px; font-weight: 700; color: ${isPaid ? "#f43f5e" : "#f59e0b"}; margin-top: 2px;">
                      ${isPaid ? "✓ Paid (Paystack)" : "Cash on Delivery"}
                    </div>
                  </td>
                  <td style="padding: 4px 0 4px 12px;" align="right">
                    <div style="font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.12em; color: #71717a;">TOTAL</div>
                    <div style="font-size: 16px; font-weight: 900; color: #f43f5e; margin-top: 2px;">${formatPrice(payload.total)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 36px;">
              <div style="font-size: 10px; font-family: monospace; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #71717a; margin-bottom: 10px;">
                CURATED ITEMS (${payload.items.length})
              </div>
              <table width="100%" cellspacing="0" cellpadding="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Price Calculation Breakdown -->
          <tr>
            <td style="padding: 24px 36px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #a1a1aa;">
                <tr>
                  <td style="padding: 5px 0;">Subtotal</td>
                  <td align="right" style="color: #ffffff; font-weight: 600;">${formatPrice(payload.subtotal)}</td>
                </tr>
                ${
                  payload.discount > 0
                    ? `<tr>
                  <td style="padding: 5px 0; color: #f43f5e; font-weight: 600;">VIP Discount Applied</td>
                  <td align="right" style="color: #f43f5e; font-weight: 700;">-${formatPrice(payload.discount)}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 5px 0;">${isPickup ? "Showroom Pickup Fee" : "Doorstep Courier Delivery"}</td>
                  <td align="right" style="color: #ffffff; font-weight: 600;">${payload.shippingFee === 0 ? "FREE" : formatPrice(payload.shippingFee)}</td>
                </tr>
                <tr style="border-top: 1px solid #27272a;">
                  <td style="padding: 14px 0 0 0; font-size: 15px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em;">Total Amount</td>
                  <td align="right" style="padding: 14px 0 0 0; font-size: 20px; font-weight: 900; color: #f43f5e;">
                    ${formatPrice(payload.total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fulfillment & Destination Card -->
          <tr>
            <td style="padding: 0 36px 32px 36px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #141418; border: 1px solid #27272a; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 11px; font-family: monospace; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #f43f5e; margin-bottom: 8px;">
                      ${isPickup ? "📍 SHOWROOM PICKUP DETAILS" : "🚚 DISPATCH DESTINATION"}
                    </div>
                    
                    <div style="font-size: 14px; font-weight: 700; color: #ffffff; line-height: 1.4;">
                      ${payload.address}
                    </div>
                    <div style="font-size: 13px; color: #a1a1aa; margin-top: 4px;">
                      ${payload.city}, ${payload.region}
                    </div>
                    
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #27272a; font-size: 12px; color: #a1a1aa;">
                      Recipient Contact: <strong style="color: #ffffff;">${payload.phone}</strong> &bull; <span style="color: #71717a;">${payload.email}</span>
                    </div>

                    ${
                      isPickup
                        ? `
                      <div style="margin-top: 12px; padding: 10px 14px; background-color: #1c1c21; border-radius: 8px; font-size: 12px; color: #e4e4e7; line-height: 1.5;">
                        <strong>Showroom Hours:</strong> Monday – Saturday, 9:30 AM – 7:30 PM.<br />
                        Please present Order #${payload.orderNumber} to our staff upon arrival.
                      </div>
                    `
                        : `
                      <div style="margin-top: 12px; padding: 10px 14px; background-color: #1c1c21; border-radius: 8px; font-size: 12px; color: #e4e4e7; line-height: 1.5;">
                        <strong>Estimated Delivery:</strong> Same-day dispatch for Assin Fosu &amp; Central Region orders placed before 3 PM. Nationwide Ghana deliveries take 24–48 hours.
                      </div>
                    `
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Buttons (Track & WhatsApp) -->
          <tr>
            <td style="padding: 0 36px 36px 36px; text-align: center;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${whatsappUrl}" style="display: inline-block; background-color: #f43f5e; color: #ffffff; font-weight: 800; font-size: 13px; text-decoration: none; padding: 14px 28px; border-radius: 9999px; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.25);">
                      Chat on WhatsApp Concierge &rarr;
                    </a>
                    <br />
                    <a href="${trackingUrl}" style="display: inline-block; color: #a1a1aa; font-size: 12px; text-decoration: underline; margin-top: 8px;">
                      View &amp; Track Order in My Customer Account
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #060608; padding: 24px 36px; border-top: 1px solid #1f1f23; text-align: center; font-size: 11px; color: #52525b; line-height: 1.6;">
              <div style="font-weight: 700; color: #71717a; margin-bottom: 4px;">
                ${STORE.name}
              </div>
              <div>${STORE.address} &bull; Hotline: ${STORE.phone}</div>
              <div style="margin-top: 6px;">
                &copy; ${new Date().getFullYear()} Urban Vault Boutique. All rights reserved.
              </div>
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
 * High-priority internal admin dispatch checklist email
 */
export function generateAdminOrderAlertHtml(payload: OrderEmailPayload): string {
  const itemsList = payload.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e4e4e7;">
        <td style="padding: 8px 0; font-weight: 600;">${item.name} ${item.size ? `<span style="background: #e4e4e7; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${item.size}</span>` : ""}</td>
        <td style="padding: 8px 0; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formatPrice(item.unitPrice * item.quantity)}</td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; padding: 24px; color: #09090b; margin: 0;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e4e4e7; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
      <div>
        <span style="background-color: #f43f5e; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">
          NEW ORDER
        </span>
        <h2 style="margin: 8px 0 0 0; font-size: 22px; color: #09090b;">
          ${payload.orderNumber}
        </h2>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 20px; font-weight: 900; color: #09090b;">${formatPrice(payload.total)}</div>
        <div style="font-size: 12px; color: ${payload.paymentStatus === "paid" ? "#f43f5e" : "#f59e0b"}; font-weight: bold;">
          ${payload.paymentStatus.toUpperCase()} (${payload.paymentMethod})
        </div>
      </div>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; line-height: 1.5;">
      <p style="margin: 0 0 6px 0;"><strong>Customer:</strong> ${payload.customerName}</p>
      <p style="margin: 0 0 6px 0;"><strong>Phone:</strong> <a href="tel:${payload.phone}" style="color: #09090b; font-weight: bold;">${payload.phone}</a> &bull; <a href="https://wa.me/${payload.phone.replace(/[^0-9]/g, "")}" style="color: #f43f5e; font-weight: bold;">WhatsApp &rarr;</a></p>
      <p style="margin: 0 0 6px 0;"><strong>Email:</strong> ${payload.email}</p>
      <p style="margin: 0 0 6px 0;"><strong>Method:</strong> ${payload.deliveryMethod.toUpperCase()}</p>
      <p style="margin: 0;"><strong>Address:</strong> ${payload.address}, ${payload.city} (${payload.region})</p>
    </div>

    <h4 style="margin: 0 0 8px 0; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em; color: #64748b;">
      Packing Checklist (${payload.items.length} item types)
    </h4>
    <table width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; margin-bottom: 24px;">
      <tr style="border-bottom: 2px solid #cbd5e1; color: #64748b; font-size: 11px; text-transform: uppercase;">
        <th align="left" style="padding-bottom: 6px;">Product</th>
        <th align="center" style="padding-bottom: 6px;">Qty</th>
        <th align="right" style="padding-bottom: 6px;">Price</th>
      </tr>
      ${itemsList}
    </table>

    ${payload.notes ? `<div style="background: #fffbeb; border: 1px solid #fde68a; padding: 12px; border-radius: 6px; font-size: 12px; margin-bottom: 20px;"><strong>Customer Notes:</strong> ${payload.notes}</div>` : ""}

    <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <a href="${STORE.siteUrl}/dashboard/orders" style="display: inline-block; background: #09090b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 13px; font-weight: 700;">
        Open in Admin Dashboard &rarr;
      </a>
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Order Status Notification Email (Dispatched, Ready for Pickup, Delivered)
 */
export function generateOrderStatusUpdateHtml(payload: {
  orderNumber: string;
  customerName: string;
  status: "processing" | "shipped" | "delivered" | "ready_for_pickup";
  trackingNote?: string;
}): string {
  const statusLabels: Record<string, { title: string; desc: string; badge: string }> = {
    processing: {
      title: "Your Order is Being Prepared",
      desc: "Our styling team has selected your items and is boxing them for dispatch.",
      badge: "PROCESSING",
    },
    shipped: {
      title: "Your Drop is on the Way!",
      desc: "Our courier has picked up your package for doorstep delivery.",
      badge: "DISPATCHED",
    },
    ready_for_pickup: {
      title: "Ready for Showroom Pickup",
      desc: "Your order is ready and waiting at the Urban Vault Assin Fosu Showroom.",
      badge: "READY FOR PICKUP",
    },
    delivered: {
      title: "Order Delivered!",
      desc: "Your order has been marked as delivered. We hope you love the fit!",
      badge: "DELIVERED",
    },
  };

  const current = statusLabels[payload.status] || statusLabels["processing"];

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #050507; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #e4e4e7;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 12px; background-color: #050507;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #0c0c0e; border: 1px solid #1f1f23; border-radius: 16px; overflow: hidden; padding: 32px;" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <div style="font-family: monospace; font-size: 11px; font-weight: 700; color: #f43f5e; letter-spacing: 0.15em; text-transform: uppercase;">
                ${STORE.name} &bull; ${payload.orderNumber}
              </div>
              <h1 style="font-size: 22px; font-weight: 900; color: #ffffff; margin: 12px 0 0 0;">
                ${current.title}
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 12px 0 20px 0;">
                Hello ${payload.customerName},<br />
                ${current.desc}
              </p>

              ${
                payload.trackingNote
                  ? `<div style="background-color: #141418; border: 1px solid #27272a; border-radius: 8px; padding: 14px; font-size: 13px; color: #ffffff; margin-bottom: 24px;">
                  <strong>Dispatch Note:</strong> ${payload.trackingNote}
                </div>`
                  : ""
              }

              <div style="text-align: center; margin-top: 24px;">
                <a href="${STORE.siteUrl}/account" style="display: inline-block; background-color: #f43f5e; color: #ffffff; font-weight: 800; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 9999px;">
                  View Order Status &rarr;
                </a>
              </div>
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
 * Dispatches both customer confirmation and admin notification emails
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
  const fromEmail = process.env["FROM_EMAIL"] || "Urban Vault <onboarding@resend.dev>";

  // Fallback: If no RESEND_API_KEY is configured, log for development / zero-cost testing
  if (!resendApiKey) {
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log(`[TRANSACTIONAL EMAIL ENGINE] (Dev Simulation — set RESEND_API_KEY to send live)`);
    console.log(`To Customer: ${payload.email}`);
    console.log(`Subject: Order Confirmed: ${payload.orderNumber} — Urban Vault Boutique`);
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

    if (!custRes.ok) {
      const errBody = await custRes.text();
      console.error("[sendOrderEmails] Customer email dispatch error:", errBody);
    }

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

    if (!adminRes.ok) {
      const errBody = await adminRes.text();
      console.error("[sendOrderEmails] Admin alert email dispatch error:", errBody);
    }

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

/**
 * Server function to send a live test email from dashboard/settings
 */
export const serverSendTestEmail = createServerFn({ method: "POST" })
  .validator((data: { toEmail: string }) => data)
  .handler(async ({ data }) => {
    try {
      const email = data.toEmail.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid recipient email address.");
      }

      const samplePayload: OrderEmailPayload = {
        orderNumber: `UV-${new Date().getFullYear().toString().slice(-2)}${String(
          new Date().getMonth() + 1
        ).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.floor(
          1000 + Math.random() * 9000
        )}`,
        orderId: "test-order-id",
        customerName: email.split("@")[0] || "Valued Customer",
        email,
        phone: "+233 59 748 9841",
        deliveryMethod: "delivery",
        address: "Main Commercial High Street, Assin Fosu",
        city: "Assin Fosu",
        region: "Central (Within Assin Fosu)",
        paymentMethod: "Paystack (Visa / Mastercard / MoMo)",
        paymentStatus: "paid",
        paymentReference: `TEST-${Date.now()}`,
        subtotal: 980,
        discount: 98,
        shippingFee: 20,
        total: 902,
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
        notes: "Test delivery dispatch from Urban Vault admin settings.",
      };

      const result = await sendOrderEmails(samplePayload);
      return { success: true, ...result };
    } catch (err: any) {
      console.error("[serverSendTestEmail] Error:", err);
      throw new Error(err.message || "Failed to send test email.");
    }
  });
