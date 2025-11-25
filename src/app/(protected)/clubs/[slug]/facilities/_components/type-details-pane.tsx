"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { type FacilityType } from "./types";
import { AddFacilityButton } from "./add-facility-button";
import { FacilityCard } from "./facility-card";
import { OpeningHoursEditor } from "./opening-hours-editor";
import { BookingRulesEditor } from "./booking-rules-editor";
import { cn } from "@/lib/utils";

export function TypeDetailsPane({
  type,
  clubId,
  onDelete,
}: {
  type: FacilityType;
  clubId: string;
  onDelete: () => void;
}) {
  const utils = api.useUtils();
  const [name, setName] = useState(type.name);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"facilities" | "hours" | "rules">(
    "facilities",
  );

  const updateType = api.facility.updateType.useMutation({
    onSuccess: async () => {
      await utils.facility.getTypes.invalidate();
      setIsSettingsOpen(false);
    },
  });

  const deleteType = api.facility.deleteType.useMutation({
    onSuccess: async () => {
      await utils.facility.getTypes.invalidate();
      onDelete();
    },
  });

  const createFacility = api.facility.create.useMutation({
    onSuccess: async () => {
      await utils.facility.getTypes.invalidate();
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateType.mutate({
      id: type.id,
      name,
    });
  };

  return (
    <>
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <div>
            <CardTitle>{type.name}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Facility Type</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <DialogFooter className="flex justify-between sm:justify-between">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        if (
                          confirm("Delete this type and all its facilities?")
                        ) {
                          deleteType.mutate({ id: type.id });
                        }
                      }}
                    >
                      Delete Type
                    </Button>
                    <Button type="submit" disabled={updateType.isPending}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("facilities")}
            className={cn(
              "border-b-2 pb-2 text-sm font-medium transition-colors",
              activeTab === "facilities"
                ? "border-primary text-primary"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            Facilities
          </button>
          <button
            onClick={() => setActiveTab("hours")}
            className={cn(
              "border-b-2 pb-2 text-sm font-medium transition-colors",
              activeTab === "hours"
                ? "border-primary text-primary"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            Opening Hours
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={cn(
              "border-b-2 pb-2 text-sm font-medium transition-colors",
              activeTab === "rules"
                ? "border-primary text-primary"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            Booking Rules
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {activeTab === "facilities" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-muted-foreground text-sm font-medium">
                Facilities
              </h3>
              <AddFacilityButton
                onAdd={(name, capacity) =>
                  createFacility.mutate({
                    clubId,
                    facilityTypeId: type.id,
                    name,
                    capacity,
                  })
                }
                isPending={createFacility.isPending}
              />
            </div>

            <div className="space-y-2">
              {type.facilities.map((facility) => (
                <FacilityCard key={facility.id} facility={facility} />
              ))}
              {type.facilities.length === 0 && (
                <div className="text-muted-foreground rounded-lg border-2 border-dashed py-8 text-center">
                  No facilities added yet.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "hours" && <OpeningHoursEditor type={type} />}

        {activeTab === "rules" && <BookingRulesEditor type={type} />}
      </CardContent>
    </>
  );
}
