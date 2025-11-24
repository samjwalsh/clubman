import type { LucideIcon } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { usePathname } from "next/navigation";

const PageButton = ({
  name,
  url,
  icon,
}: {
  name: string;
  url: string;
  icon: LucideIcon;
}) => {
  const pathname = usePathname();
  const Icon = icon;
  return (
    <SidebarMenuItem className={pathname === url ? "bg-accent" : ""}>
      <SidebarMenuButton asChild>
        <a href={url}>
          <Icon />
          <span>{name}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default PageButton;
