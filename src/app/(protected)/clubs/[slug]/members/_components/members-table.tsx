"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

import { api } from "@/trpc/react";
import { authClient } from "@/server/better-auth/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { DataTable } from "./data-table";
import { columns, type Member, type ColumnMeta } from "./columns";
import { InviteMemberModal } from "./invite-member-modal";

interface MembersTableProps {
  clubId: string;
}

const roles = ["owner", "admin", "coach", "member"] as const;
const statuses = ["active", "suspended"] as const;

export function MembersTable({ clubId }: MembersTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: session } = authClient.useSession();
  const utils = api.useUtils();

  const { data: members, isLoading } = api.club.getMembers.useQuery({ clubId });

  const updateMember = api.club.updateMember.useMutation({
    onSuccess: () => {
      void utils.club.getMembers.invalidate({ clubId });
    },
  });

  const handleRoleChange = (memberId: string, role: Member["role"]) => {
    updateMember.mutate({ clubId, memberId, role });
  };

  const handleStatusChange = (memberId: string, status: Member["status"]) => {
    updateMember.mutate({ clubId, memberId, status });
  };

  const tableMeta: ColumnMeta = {
    currentUserId: session?.user?.id ?? "",
    onRoleChange: handleRoleChange,
    onStatusChange: handleStatusChange,
  };

  const filteredMembers = useMemo(() => {
    if (!members) return [];

    return members.filter((member) => {
      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || member.status === statusFilter;
      const matchesSearch =
        globalFilter === "" ||
        member.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        member.email.toLowerCase().includes(globalFilter.toLowerCase());

      return matchesRole && matchesStatus && matchesSearch;
    }) as Member[];
  }, [members, roleFilter, statusFilter, globalFilter]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[150px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and add button */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name or email..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <InviteMemberModal clubId={clubId} />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data table */}
      <DataTable columns={columns} data={filteredMembers} meta={tableMeta} />

      {/* Member count */}
      <div className="text-muted-foreground text-sm">
        Showing {filteredMembers.length} of {members?.length ?? 0} members
      </div>
    </div>
  );
}
