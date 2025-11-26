import { notFound } from "next/navigation";

import { api } from "@/trpc/server";
import { MembersTable } from "./_components/members-table";
import Heading from "../_components/page-title";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = await api.club.getBySlug({ slug });

  if (!club) {
    notFound();
  }

  return (
    <div>
      <Heading title="Members" subtitle="Add and manage club members." />
      <MembersTable clubId={club.id} />
    </div>
  );
}
