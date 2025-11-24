import { api } from "@/trpc/server";
import { FacilitiesManager } from "./_components/facilities-manager";
import { notFound } from "next/navigation";

export default async function FacilitiesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = await api.club.getBySlug({ slug });

  if (!club) {
    notFound();
  }

  return <FacilitiesManager clubId={club.id} />;
}
