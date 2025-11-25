"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateTypeForm } from "./create-type-form";
import { TypeDetailsPane } from "./type-details-pane";

export function FacilitiesManager({ clubId }: { clubId: string }) {
  const utils = api.useUtils();
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [isCreateTypeOpen, setIsCreateTypeOpen] = useState(false);

  const { data: facilityTypes, isLoading } = api.facility.getTypes.useQuery({
    clubId,
  });

  const selectedType = facilityTypes?.find((t) => t.id === selectedTypeId);

  // Mutations
  const createType = api.facility.createType.useMutation({
    onSuccess: async (data) => {
      await utils.facility.getTypes.invalidate();
      setIsCreateTypeOpen(false);
      setSelectedTypeId(data[0]?.id ?? null);
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid h-[calc(100vh-10rem)] grid-cols-1 gap-2 lg:grid-cols-12">
      {/* Left Pane: Facility Types List */}
      <Card className="flex h-full flex-col lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Facility Types</CardTitle>
          <Dialog open={isCreateTypeOpen} onOpenChange={setIsCreateTypeOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Facility Type</DialogTitle>
              </DialogHeader>
              <CreateTypeForm
                clubId={clubId}
                onSubmit={(data) => createType.mutate(data)}
                isPending={createType.isPending}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto pt-2">
          <div className="space-y-2">
            {facilityTypes?.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedTypeId(type.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors",
                  selectedTypeId === type.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{type.name}</span>
                  <span
                    className={cn(
                      "text-xs",
                      selectedTypeId === type.id
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {type.facilities.length} facilities
                  </span>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4",
                    selectedTypeId === type.id
                      ? "text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                />
              </button>
            ))}
            {facilityTypes?.length === 0 && (
              <div className="text-muted-foreground py-8 text-center text-sm">
                No facility types yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right Pane: Details & Facilities */}
      <Card className="flex h-full flex-col lg:col-span-8">
        {selectedType ? (
          <TypeDetailsPane
            key={selectedType.id}
            type={selectedType}
            clubId={clubId}
            onDelete={() => setSelectedTypeId(null)}
          />
        ) : (
          <div className="text-muted-foreground flex flex-1 items-center justify-center">
            Select a facility type to manage
          </div>
        )}
      </Card>
    </div>
  );
}
