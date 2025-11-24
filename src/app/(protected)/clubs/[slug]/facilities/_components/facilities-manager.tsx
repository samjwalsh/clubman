"use client";

import { useState } from "react";
import { api, type RouterOutputs } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Settings, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type FacilityType = RouterOutputs["facility"]["getTypes"][number];
type Facility = FacilityType["facilities"][number];

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
    <div className="grid h-[calc(100vh-10rem)] grid-cols-1 gap-6 md:grid-cols-12">
      {/* Left Pane: Facility Types List */}
      <Card className="flex h-full flex-col md:col-span-4">
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
                    {type.facilities.length} facilities •{" "}
                    {type.bookingIntervalMinutes}m intervals
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
      <Card className="flex h-full flex-col md:col-span-8">
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

function CreateTypeForm({
  clubId,
  onSubmit,
  isPending,
}: {
  clubId: string;
  onSubmit: (data: {
    clubId: string;
    name: string;
    bookingIntervalMinutes: number;
  }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [interval, setInterval] = useState("30");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      clubId,
      name,
      bookingIntervalMinutes: parseInt(interval),
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
      <div className="space-y-2">
        <Label htmlFor="interval">Booking Interval (minutes)</Label>
        <Input
          id="interval"
          type="number"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          min="15"
          step="15"
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

function TypeDetailsPane({
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
  const [interval, setInterval] = useState(
    type.bookingIntervalMinutes.toString(),
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      bookingIntervalMinutes: parseInt(interval),
    });
  };

  return (
    <>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{type.name}</CardTitle>
            <CardDescription>
              {type.bookingIntervalMinutes} minute intervals •{" "}
              {type.facilities.length} facilities
            </CardDescription>
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
                  <div className="space-y-2">
                    <Label>Interval (min)</Label>
                    <Input
                      type="number"
                      value={interval}
                      onChange={(e) => setInterval(e.target.value)}
                      step="15"
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
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-muted-foreground text-sm font-medium">
              Facilities
            </h3>
            <AddFacilityButton
              onAdd={(name) =>
                createFacility.mutate({ clubId, facilityTypeId: type.id, name })
              }
              isPending={createFacility.isPending}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {type.facilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
            {type.facilities.length === 0 && (
              <div className="text-muted-foreground col-span-full rounded-lg border-2 border-dashed py-8 text-center">
                No facilities added yet.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </>
  );
}

function AddFacilityButton({
  onAdd,
  isPending,
}: {
  onAdd: (name: string) => void;
  isPending: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name);
    setName("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Facility
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Facility</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Court 1"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending || !name.trim()}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FacilityCard({ facility }: { facility: Facility }) {
  const utils = api.useUtils();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(facility.name);

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
    updateFacility.mutate({ id: facility.id, name });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="group bg-card hover:border-primary/50 hover:bg-accent/50 relative flex cursor-pointer flex-col items-center justify-center rounded-lg border p-6 transition-all">
          <div className="bg-primary/10 group-hover:bg-primary/20 mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
            <span className="text-primary text-lg font-semibold">
              {facility.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-center font-medium">{facility.name}</span>
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
