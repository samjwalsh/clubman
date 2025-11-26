"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ClubsRedirectProps {
  firstClubSlug: string;
}

export function ClubsRedirect({ firstClubSlug }: ClubsRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const lastClubSlug = localStorage.getItem("lastClubSlug");
    if (lastClubSlug) {
      router.replace(`/clubs/${lastClubSlug}/dashboard`);
    } else {
      router.replace(`/clubs/${firstClubSlug}/dashboard`);
    }
  }, [router, firstClubSlug]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  );
}
