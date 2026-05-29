"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only run redirection logic when not loading
    if (!loading) {
      const isPublicPath = pathname === "/login" || pathname === "/register";
      const token = getToken();

      // If user is not logged in (no token or no user data) and trying to access protected route
      if ((!token || !user) && !isPublicPath) {
        router.replace("/login");
      }
      // If user is logged in and trying to access public route (login/register)
      else if (token && user && isPublicPath) {
        router.replace("/dashboard");
      }
    }
  }, [pathname, router, user, loading]);

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Prevent flash of protected content before redirect
  const isPublicPath = pathname === "/login" || pathname === "/register";
  const token = getToken();
  
  if (!isPublicPath && (!token || !user)) {
    return null; // Or a minimal loading spinner if preferred, but null prevents flash
  }
  
  if (isPublicPath && token && user) {
    return null; // Prevent flash of login page when already logged in
  }

  return <>{children}</>;
}
