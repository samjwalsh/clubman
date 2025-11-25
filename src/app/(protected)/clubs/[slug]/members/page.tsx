import { notFound } from "next/navigation";

import { api } from "@/trpc/server";
import { MembersTable } from "./_components/members-table";

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
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Members</h1>
        <p className="text-muted-foreground">
          Manage your club members and their roles.
        </p>
      </div>
      <MembersTable clubId={club.id} />
    </div>
  );
}
