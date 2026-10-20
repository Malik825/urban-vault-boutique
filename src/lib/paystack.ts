// ─── Paystack Ghana Integration ──────────────────────────────────────────────
// Supports Debit/Credit Cards (Visa, Mastercard) and Mobile Money (MTN, Telecel, AirtelTigo)

export const PAYSTACK_PUBLIC_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_PAYSTACK_PUBLIC_KEY) ||
  "pk_test_3e02401342d2710f67c9849838e96616b8e47dfe";

export interface PaystackSuccessResponse {
  reference: string;
  trans?: string;
  status: string;
  message?: string;
  transaction?: string;
  trxref?: string;
}

export interface PaystackCheckoutOptions {
  email: string;
  amount: number; // in GHS (e.g. 150 for GH₵ 150)
  firstName?: string;
  lastName?: string;
  phone?: string;
  orderNumber?: string;
  channels?: Array<"card" | "mobile_money" | "bank" | "ussd" | "qr">;
  metadata?: Record<string, any>;
  onSuccess: (response: PaystackSuccessResponse) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string;
        email: string;
        amount: number; // in pesewas (GHS * 100)
        currency: string;
        ref?: string;
        channels?: string[];
        firstname?: string;
        lastname?: string;
        phone?: string;
        metadata?: {
          custom_fields?: Array<{
            display_name: string;
            variable_name: string;
            value: string;
          }>;
          [key: string]: any;
        };
        callback: (response: PaystackSuccessResponse) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

let scriptLoadingPromise: Promise<boolean> | null = null;

/**
 * Dynamically loads the official Paystack inline JS SDK (v1)
 */
export function loadPaystackScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.PaystackPop) {
    return Promise.resolve(true);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise<boolean>((resolve, reject) => {
    const existing = document.getElementById("paystack-inline-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => reject(new Error("Failed to load Paystack script")));
      return;
    }

    const script = document.createElement("script");
    script.id = "paystack-inline-js";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      scriptLoadingPromise = null;
      reject(new Error("Could not load Paystack Inline checkout script."));
    };

    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

/**
 * Launch the Paystack popup modal for Ghana payment
 */
export async function initializePaystackCheckout({
  email,
  amount,
  firstName = "",
  lastName = "",
  phone = "",
  orderNumber,
  channels = ["card", "mobile_money"],
  metadata = {},
  onSuccess,
  onClose,
}: PaystackCheckoutOptions): Promise<void> {
  await loadPaystackScript();

  if (!window.PaystackPop) {
    throw new Error("Paystack SDK is not available. Please check your internet connection.");
  }

  // Generate unique Paystack transaction reference
  const reference = `UV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Ghana GHS: 1 GHS = 100 pesewas (integer required)
  const amountInPesewas = Math.round(amount * 100);

  const customFields = [
    { display_name: "Customer Name", variable_name: "customer_name", value: `${firstName} ${lastName}`.trim() },
    { display_name: "Phone Number", variable_name: "phone_number", value: phone },
    { display_name: "Store", variable_name: "store", value: "Urban Vault Boutique" },
  ];

  if (orderNumber) {
    customFields.push({ display_name: "Order Number", variable_name: "order_number", value: orderNumber });
  }

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email.trim() || "customer@urbanvaultgh.com",
    amount: amountInPesewas,
    currency: "GHS",
    ref: reference,
    channels,
    firstname: firstName,
    lastname: lastName,
    phone,
    metadata: {
      custom_fields: customFields,
      ...metadata,
    },
    callback: (response: PaystackSuccessResponse) => {
      onSuccess(response);
    },
    onClose: () => {
      if (onClose) onClose();
    },
  });

  handler.openIframe();
}
