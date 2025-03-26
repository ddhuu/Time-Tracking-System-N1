"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LocaleRootPage() {
  const router = useRouter();

  // Redirect to dashboard
  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Redirecting to dashboard...</p>
    </div>
  );
}
