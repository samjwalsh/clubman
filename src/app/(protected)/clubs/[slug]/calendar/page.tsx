import { api, HydrateClient } from "@/trpc/server";
import CalendarClient from "./calendar-client";

export default async function Page({ params }: { params: { slug: string } }) {
  const club = await api.club.getBySlug({ slug: params.slug });
  const facilityTypes = await api.facility.getTypes({ clubId: club.id });

  return (
    <HydrateClient>
      <CalendarClient clubId={club.id} facilityTypes={facilityTypes} />
    </HydrateClient>
  );
}
