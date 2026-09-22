"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

/**
 * Redirects to /login if the user turns out to be unauthenticated. Waits for
 * `status` to leave "loading" first so a page doesn't flash its protected
 * content (or bounce a still-being-checked visitor) before Firebase's
 * onAuthStateChanged has reported back.
 */
export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  return { user, isChecking: status === "loading" };
}
