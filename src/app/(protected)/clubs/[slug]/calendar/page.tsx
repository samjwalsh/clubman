import { api, HydrateClient } from "@/trpc/server";
import CalendarClient from "./calendar-client";
import { getSession } from "@/server/better-auth/server";
import Heading from "../_components/page-title";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  const { slug } = await params;
  const club = await api.club.getBySlug({ slug });
  const facilityTypes = await api.facility.getTypes({ clubId: club.id });

  return (
    <HydrateClient>
      <Heading
        title="Calendar"
        subtitle="Create and manage facility bookings."
      />
      <CalendarClient
        clubId={club.id}
        facilityTypes={facilityTypes}
        userId={session?.user.id ?? ""}
      />
    </HydrateClient>
  );
}
