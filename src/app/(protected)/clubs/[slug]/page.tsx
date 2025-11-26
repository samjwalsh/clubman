"use client";
import { redirect, useParams } from "next/navigation";

export default function ClubPage() {
  const params = useParams();
  const slug = params.slug as string;
  redirect(`/clubs/${slug}/dashboard`);
}
