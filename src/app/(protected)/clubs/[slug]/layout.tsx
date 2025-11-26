import { api } from "@/trpc/server";

import { AppSidebar } from "./_components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ClubSlugTracker } from "./club-slug-tracker";

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
      <SidebarInset className="min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>What should go here?</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="p-2 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
