import { redirect } from "next/navigation";

import { getSession } from "@/server/better-auth/server";
import { api } from "@/trpc/server";
import { ClubsRedirect } from "./clubs-redirect";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const clubs = await api.club.getAll();

  if (clubs.length > 0) {
    return <ClubsRedirect firstClubSlug={clubs[0]!.slug} />;
  }

  return <div>You are not a member of any club.</div>;
}
