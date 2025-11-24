"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  GalleryVerticalEnd,
  Pencil,
  PersonStanding,
} from "lucide-react";

import { NavUser } from "@/app/(protected)/clubs/_components/nav-user";
import { ClubSwitcher } from "@/app/(protected)/clubs/_components/club-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/server/better-auth/client";
import PageButton from "./page-button";

type Club = {
  id: string;
  name: string;
  logoUrl: string | null;
  slug: string;
  role: string;
};

export function AppSidebar({
  clubs,
  ...props
}: React.ComponentProps<typeof Sidebar> & { clubs: Club[] }) {
  const session = authClient.useSession();
  const user = session.data?.user ?? { email: "", name: "", image: "" };
  const params = useParams();
  const slug = params.slug as string;
  const activeClub = clubs.find((c) => c.slug === slug) ?? clubs[0];

  const pages = [
    {
      name: "Dashboard",
      url: `dashboard`,
      icon: GalleryVerticalEnd,
      visibility: ["owner", "admin", "coach", "member"],
    },
    {
      name: "Calendar",
      url: `calendar`,
      icon: Calendar,
      visibility: ["owner", "admin", "coach", "member"],
    },
    {
      name: "Members",
      url: `members`,
      icon: PersonStanding,
      visibility: ["owner", "admin"],
    },
    {
      name: "Manage Facilities",
      url: "facilities",
      visibility: ["owner", "admin"],
      icon: Pencil,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ClubSwitcher clubs={clubs} />
      </SidebarHeader>
      <SidebarContent className="mx-2">
        {pages.map((page, i) => {
          if (!activeClub) return;
          if (!page.visibility.includes(activeClub.role)) return;
          return (
            <PageButton
              key={i}
              name={page.name}
              url={`/clubs/${slug}/${page.url}`}
              icon={page.icon}
            />
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
