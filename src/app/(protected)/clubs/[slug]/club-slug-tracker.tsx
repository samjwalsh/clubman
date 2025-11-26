"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export function ClubSlugTracker() {
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      localStorage.setItem("lastClubSlug", slug);
    }
  }, [slug]);

  return null;
}
