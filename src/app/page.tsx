import { redirect } from "next/navigation";
import { getSession } from "@/server/better-auth/server";
import { MarketingPage } from "@/components/marketing-page";

export default async function RootPage() {
  const session = await getSession();

  if (session) {
    redirect("/clubs");
  }

  return <MarketingPage />;
}
