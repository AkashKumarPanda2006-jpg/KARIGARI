"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BuyerRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/marketplace");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 animate-pulse">Redirecting to Marketplace...</p>
    </div>
  );
}
