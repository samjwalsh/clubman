"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { type Facility } from "./types";

export function FacilityCard({ facility }: { facility: Facility }) {
  const utils = api.useUtils();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(facility.name);
  const [capacity, setCapacity] = useState(facility.capacity.toString());

  const updateFacility = api.facility.update.useMutation({
    onSuccess: async () => {
      await utils.facility.getTypes.invalidate();
      setIsOpen(false);
    },
  });

  const deleteFacility = api.facility.delete.useMutation({
    onSuccess: async () => {
      await utils.facility.getTypes.invalidate();
      setIsOpen(false);
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateFacility.mutate({
      id: facility.id,
      name,
      capacity: parseInt(capacity),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="group bg-card hover:bg-accent/50 flex w-full cursor-pointer items-center justify-between rounded-lg border p-3 transition-all">
          <div className="flex items-center gap-3">
            <span className="font-medium">{facility.name}</span>
            <span className="text-muted-foreground text-sm">
              (Capacity: {facility.capacity})
            </span>
          </div>
          <Settings className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Facility</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Capacity</Label>
            <Input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="1"
            />
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (confirm("Delete this facility?")) {
                  deleteFacility.mutate({ id: facility.id });
                }
              }}
            >
              Delete
            </Button>
            <Button type="submit" disabled={updateFacility.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
