"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: "owner" | "admin" | "coach" | "member";
  status: "active" | "suspended";
  joinedAt: Date;
};

export type ColumnMeta = {
  currentUserId: string;
  onRoleChange: (memberId: string, role: Member["role"]) => void;
  onStatusChange: (memberId: string, status: Member["status"]) => void;
};

const roles = ["owner", "admin", "coach", "member"] as const;
const statuses = ["active", "suspended"] as const;

const roleColors: Record<Member["role"], string> = {
  owner:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  coach: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  member: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const statusColors: Record<Member["status"], string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

function SortableHeader({
  column,
  children,
}: {
  column: {
    toggleSorting: (desc?: boolean) => void;
    getIsSorted: () => "asc" | "desc" | false;
  };
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="-ml-4"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

export const columns: ColumnDef<Member>[] = [
  {
    id: "avatar",
    header: "",
    cell: ({ row }) => {
      const member = row.original;
      const initials = member.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.image ?? undefined} alt={member.name} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column}>Name</SortableHeader>
    ),
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <SortableHeader column={column}>Email</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.original.email}</div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <SortableHeader column={column}>Role</SortableHeader>
    ),
    cell: ({ row, table }) => {
      const member = row.original;
      const meta = table.options.meta as ColumnMeta | undefined;
      const isCurrentUser = meta?.currentUserId === member.userId;

      if (isCurrentUser || !meta) {
        return (
          <Badge variant="outline" className={roleColors[member.role]}>
            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
          </Badge>
        );
      }

      return (
        <Select
          value={member.role}
          onValueChange={(value: Member["role"]) =>
            meta.onRoleChange(member.id, value)
          }
        >
          <SelectTrigger className="h-7 w-[100px] border-none bg-transparent p-0 hover:bg-transparent">
            <Badge variant="outline" className={roleColors[member.role]}>
              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                <Badge variant="outline" className={roleColors[role]}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column}>Status</SortableHeader>
    ),
    cell: ({ row, table }) => {
      const member = row.original;
      const meta = table.options.meta as ColumnMeta | undefined;
      const isCurrentUser = meta?.currentUserId === member.userId;

      if (isCurrentUser || !meta) {
        return (
          <Badge variant="outline" className={statusColors[member.status]}>
            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
          </Badge>
        );
      }

      return (
        <Select
          value={member.status}
          onValueChange={(value: Member["status"]) =>
            meta.onStatusChange(member.id, value)
          }
        >
          <SelectTrigger className="h-7 w-[100px] border-none bg-transparent p-0 hover:bg-transparent">
            <Badge variant="outline" className={statusColors[member.status]}>
              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                <Badge variant="outline" className={statusColors[status]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "joinedAt",
    header: ({ column }) => (
      <SortableHeader column={column}>Joined</SortableHeader>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground">
          {new Date(row.original.joinedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
];
