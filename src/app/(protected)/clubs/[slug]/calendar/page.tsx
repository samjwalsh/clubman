import { api, HydrateClient } from "@/trpc/server";
import CalendarClient from "./calendar-client";
import { getSession } from "@/server/better-auth/server";

export default async function Page({ params }: { params: { slug: string } }) {
  const session = await getSession();
  const { slug } = await params;
  const club = await api.club.getBySlug({ slug });
  const facilityTypes = await api.facility.getTypes({ clubId: club.id });

  return (
    <HydrateClient>
      <CalendarClient
        clubId={club.id}
        facilityTypes={facilityTypes}
        userId={session?.user.id ?? ""}
      />
    </HydrateClient>
  );
}
