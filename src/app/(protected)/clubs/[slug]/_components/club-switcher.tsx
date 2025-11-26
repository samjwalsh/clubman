"use client";

import * as React from "react";
import { ChevronsUpDown, Volleyball } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";

export function ClubSwitcher({
  clubs = [],
}: {
  clubs: {
    id: string;
    name: string;
    logoUrl: string | null;
    slug: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const params = useParams();
  const router = useRouter();

  const activeClub = clubs.find((c) => c.slug === params.slug) ?? clubs[0];

  if (!activeClub) {
    return null;
  }

  const handleClubChange = (club: (typeof clubs)[0]) => {
    router.push(`/clubs/${club.slug}/dashboard`);
  };

  const renderLogo = (logo: string | null, className?: string) => {
    if (typeof logo === "string") {
      return <Image src={logo} alt="Logo" className={className} />;
    }
    return <Volleyball className={className} />;
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {renderLogo(activeClub.logoUrl, "size-4")}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeClub.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Clubs
            </DropdownMenuLabel>
            {clubs.map((club) => (
              <DropdownMenuItem
                key={club.id}
                onClick={() => handleClubChange(club)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  {renderLogo(club.logoUrl, "size-3.5 shrink-0")}
                </div>
                {club.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
