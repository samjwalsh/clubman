"use client";

import * as React from "react";
import {
  AudioWaveform,
  Book,
  Calendar,
  Clock,
  Command,
  GalleryVerticalEnd,
  Sprout,
} from "lucide-react";

import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/server/better-auth/client";
import PageButton from "./page-button";

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
};

//TODO these would eventually come from the DB based on what features the tenant is paying for
const pages = [
  {
    name: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    name: "Classes",
    url: "/classes",
    icon: Book,
  },
  {
    name: "Something Else",
    url: "/uh",
    icon: Clock,
  },
  {
    name: "Another Thing",
    url: "/g",
    icon: Sprout,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = authClient.useSession();
  const user = session.data?.user ?? { email: "", name: "", image: "" };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="mx-2">
        {pages.map((page, i) => (
          <PageButton
            key={i}
            name={page.name}
            url={page.url}
            icon={page.icon}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
