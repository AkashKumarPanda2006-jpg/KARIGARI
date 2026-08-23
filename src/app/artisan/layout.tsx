"use client";

import { VoiceOnboarding } from "@/components/VoiceOnboarding";
import { usePathname } from "next/navigation";

export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <>
      {children}
      <VoiceOnboarding currentRoute={pathname} />
    </>
  );
}
