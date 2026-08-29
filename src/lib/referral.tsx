import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Hook to track referral codes in the URL and store them in localStorage
 */
export function useReferralTracking() {
  const search = useRouterState({ select: (s) => s.location.search as Record<string, string> });

  useEffect(() => {
    // If a referral code is present in the URL (e.g. ?ref=CODE)
    if (search.ref && typeof search.ref === "string") {
      // Store the referral code in localStorage so it persists until checkout
      localStorage.setItem("voltix-referral-code", search.ref);
    }
  }, [search.ref]);
}

/**
 * Helper to get the current referral code
 */
export function getReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("voltix-referral-code");
}

/**
 * Helper to clear the referral code after a successful order
 */
export function clearReferralCode() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("voltix-referral-code");
  }
}
