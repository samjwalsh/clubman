"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";

export function CreateTypeForm({
  clubId,
  onSubmit,
  isPending,
}: {
  clubId: string;
  onSubmit: (data: { clubId: string; name: string }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      clubId,
      name,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Tennis Court"
          required
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Type"}
        </Button>
      </DialogFooter>
    </form>
  );
}
