import { api } from "@/trpc/server";

import { AppSidebar } from "./_components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ClubSlugTracker } from "./club-slug-tracker";
import { ModeToggle } from "@/components/mode-toggle";

export default async function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clubs = await api.club.getAll();

  return (
    <SidebarProvider>
      <ClubSlugTracker />
      <AppSidebar clubs={clubs} />
      <SidebarInset className="flex min-w-0 flex-col">
        <header className="flex h-12 w-full shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <ModeToggle />
        </header>
        <div className="border-2 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
