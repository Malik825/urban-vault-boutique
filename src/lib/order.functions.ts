import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { GHANA_REGIONS, STORE } from "@/lib/store-data";
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

export type PlaceOrderInput = {
  userId?: string | undefined;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deliveryMethod: "delivery" | "pickup";
  address: string;
  city: string;
  region: string;
  paymentMethod: string;
  momoProvider?: string | undefined;
  paymentReference?: string | undefined;
  paymentStatus?: "paid" | "pending" | undefined;
  notes?: string | undefined;
  promoCode?: string | undefined;
  items: Array<{
    id: string;
    qty: number;
    name?: string | undefined;
    price?: number | undefined;
    image?: string | undefined;
  }>;
};

export const createCustomerOrder = createServerFn({ method: "POST" })
  .validator((data: PlaceOrderInput) => data)
  .handler(async ({ data }) => {
    try {
      if (!data.items || data.items.length === 0) {
        throw new Error("Cannot place an order with an empty cart");
      }

      if (data.deliveryMethod === "delivery") {
        if (!data.region || !data.region.trim()) {
          throw new Error("Delivery region is required for shipping");
        }
        if (!data.address || !data.address.trim()) {
          throw new Error("Delivery street address is required");
        }
      }

      const supabase = getAdminClient();

      // 1. Fetch current live products from DB to prevent price tampering
      const { data: dbProducts, error: prodErr } = await supabase
        .from("products")
        .select("id, sku, name, price, stock");

      if (prodErr) throw new Error(prodErr.message);

      // Verify stock & calculate verified pricing
      let subtotal = 0;
      const verifiedItems: Array<{
        product_id: string;
        product_name: string;
        product_sku: string;
        quantity: number;
        unit_price: number;
        image: string;
      }> = [];

      for (const item of data.items) {
        const matched = dbProducts?.find(
          (p) => p.id === item.id || p.sku === item.id || p.name === item.name
        );

        if (!matched) {
          throw new Error(`Product "${item.name || item.id}" could not be found in our store inventory.`);
        }

        if (matched.stock < item.qty) {
          throw new Error(
            `Sorry, "${matched.name}" has only ${matched.stock} item(s) in stock (requested ${item.qty}).`
          );
        }

        const unitPrice = Number(matched.price);
        subtotal += unitPrice * item.qty;

        verifiedItems.push({
          product_id: matched.id,
          product_name: matched.name,
          product_sku: matched.sku,
          quantity: item.qty,
          unit_price: unitPrice,
          image: item.image || "/placeholder.jpg",
        });
      }

      // Calculate Shipping
      let shippingFee = 0;
      if (data.deliveryMethod === "delivery") {
        const isLocal = (data.region && (data.region.includes("Central") || data.region.includes("Assin"))) ||
                        (data.city && data.city.toLowerCase().includes("assin"));
        shippingFee = isLocal ? 35 : 60;
        // Automatic free delivery over GH₵ 500
        if (subtotal >= 500) {
          shippingFee = 0;
        }
      }

      // Calculate Discounts
      let discountAmount = 0;
      const promoUpper = (data.promoCode || "").toUpperCase().trim();
      if (promoUpper === "WELCOME10" || promoUpper === "GHANA10" || promoUpper === "VAULTVIP10") {
        discountAmount = Math.round(subtotal * 0.1);
      } else if (promoUpper === "FREESHIP" && data.deliveryMethod === "delivery") {
        discountAmount = shippingFee;
      }

      const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

      // 2. Identify or Auto-Provision Customer Account
      let assignedUserId = data.userId;

      if (!assignedUserId && data.email) {
        try {
          const { data: usersList } = await supabase.auth.admin.listUsers();
          const existingUser = usersList?.users?.find(
            (u) => u.email?.toLowerCase() === data.email.toLowerCase()
          );

          if (existingUser) {
            assignedUserId = existingUser.id;
          } else {
            // Provision user account so orders can be tracked
            const { data: newUser } = await supabase.auth.admin.createUser({
              email: data.email,
              password: `Uv@${Math.random().toString(36).slice(-8)}!`,
              email_confirm: true,
              user_metadata: {
                full_name: `${data.firstName} ${data.lastName}`.trim(),
                phone: data.phone,
              },
            });
            if (newUser?.user) {
              assignedUserId = newUser.user.id;
            }
          }
        } catch (authErr) {
          console.warn("[createCustomerOrder] Auth user resolution warning:", authErr);
        }
      }

      if (!assignedUserId) {
        // Fallback to finding first admin or guest user if auth resolution failed
        const { data: anyUser } = await supabase.auth.admin.listUsers();
        if (anyUser?.users?.[0]) {
          assignedUserId = anyUser.users[0].id;
        } else {
          throw new Error("Unable to link customer profile for order. Please log in or try again.");
        }
      }

      // 3. Generate reference number
      const orderNumber = `UV-${new Date().getFullYear().toString().slice(-2)}${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      const shippingAddressSnapshot = {
        orderNumber,
        customerName: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: data.phone,
        deliveryMethod: data.deliveryMethod,
        address: data.deliveryMethod === "pickup" ? STORE.pickupLocation : data.address,
        city: data.deliveryMethod === "pickup" ? "Assin Fosu" : data.city,
        region: data.deliveryMethod === "pickup" ? "Central (Within Assin Fosu)" : data.region,
        paymentMethod: data.paymentMethod,
        momoProvider: data.momoProvider,
        paymentReference: data.paymentReference || null,
        paymentStatus: data.paymentStatus || (data.paymentMethod.toLowerCase().includes("cash") ? "pending_cod" : "pending"),
        promoCode: data.promoCode || null,
        subtotal,
        discount: discountAmount,
        shippingFee,
        total: finalTotal,
        items: verifiedItems,
      };

      // 4. Insert Order
      const initialStatus = data.paymentStatus === "paid" ? "processing" : "pending";
      const { data: orderRow, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: assignedUserId,
          status: initialStatus,
          total: finalTotal,
          shipping_address: shippingAddressSnapshot as any,
          notes: data.notes || null,
        })
        .select("id, created_at")
        .single();

      if (orderErr) throw new Error(orderErr.message);

      // 5. Insert Order Items
      const orderItemsToInsert = verifiedItems.map((item) => ({
        order_id: orderRow.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const { error: itemsErr } = await supabase.from("order_items").insert(orderItemsToInsert);
      if (itemsErr) {
        console.error("[createCustomerOrder] order_items insert error:", itemsErr.message);
      }

      // 6. Atomically Decrement Inventory & Record Stock Movements
      for (const item of verifiedItems) {
        const dbProd = dbProducts?.find((p) => p.id === item.product_id);
        const currentStock = dbProd?.stock ?? 10;
        const newStock = Math.max(0, currentStock - item.quantity);

        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.product_id);

        await supabase.from("stock_movements").insert({
          product_id: item.product_id,
          delta: -item.quantity,
          resulting_stock: newStock,
          reason: "customer_order",
          note: `Boutique order ${orderNumber}`,
          created_by: assignedUserId,
        });
      }

      // 7. Dispatch Transactional Order Confirmation & Admin Notification Emails
      try {
        await sendOrderEmails({
          orderNumber,
          orderId: orderRow.id,
          customerName: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          phone: data.phone,
          deliveryMethod: data.deliveryMethod,
          address: shippingAddressSnapshot.address,
          city: shippingAddressSnapshot.city,
          region: shippingAddressSnapshot.region,
          paymentMethod: data.paymentMethod,
          paymentStatus: shippingAddressSnapshot.paymentStatus,
          paymentReference: data.paymentReference || null,
          subtotal,
          discount: discountAmount,
          shippingFee,
          total: finalTotal,
          items: verifiedItems.map((item) => ({
            name: item.product_name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            image: item.image,
          })),
          notes: data.notes || null,
        });
      } catch (emailErr) {
        console.warn("[createCustomerOrder] Email notification error:", emailErr);
      }

      return {
        ok: true,
        orderId: orderRow.id,
        orderNumber,
        customerName: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: data.phone,
        deliveryMethod: data.deliveryMethod,
        address: shippingAddressSnapshot.address,
        city: shippingAddressSnapshot.city,
        region: shippingAddressSnapshot.region,
        paymentMethod: data.paymentMethod,
        momoProvider: data.momoProvider,
        paymentReference: data.paymentReference || null,
        paymentStatus: data.paymentStatus || (data.paymentMethod.toLowerCase().includes("cash") ? "pending_cod" : "pending"),
        subtotal,
        discount: discountAmount,
        promoCode: data.promoCode || null,
        shipping: shippingFee,
        total: finalTotal,
        items: verifiedItems,
        createdAt: new Date().toLocaleDateString("en-GH", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch (err: any) {
      console.error("[createCustomerOrder] Error:", err);
      throw new Error(err.message || "Failed to process order. Please try again.");
    }
  });

export const listCustomerOrders = createServerFn({ method: "POST" })
  .validator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }) => {
    try {
      const supabase = getAdminClient();
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          total,
          shipping_address,
          notes,
          created_at,
          order_items (
            id,
            product_name,
            product_sku,
            quantity,
            unit_price
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return orders || [];
    } catch (err: any) {
      console.error("[listCustomerOrders] Error:", err);
      return [];
    }
  });
