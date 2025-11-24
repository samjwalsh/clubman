"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { format, addMinutes, isAfter, endOfDay } from "date-fns";
import { Loader2, Trash2, User, Search } from "lucide-react";
import { toast } from "sonner";
import { type RouterOutputs } from "@/trpc/react";

type FacilityType = RouterOutputs["facility"]["getTypes"][number];
type Facility = FacilityType["facilities"][number];

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
  facility: Facility;
  facilityType: FacilityType;
  startTime: Date;
  currentUserId: string;
  onSuccess: () => void;
}

interface Participant {
  name?: string;
  email?: string;
  userId?: string;
  isGuest: boolean;
}

export default function BookingModal({
  isOpen,
  onClose,
  clubId,
  facility,
  facilityType,
  startTime,
  currentUserId,
  onSuccess,
}: BookingModalProps) {
  const [duration, setDuration] = useState(
    facilityType.bookingIntervalMinutes || 60,
  );
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  const utils = api.useUtils();

  const createBooking = api.booking.create.useMutation({
    onSuccess: () => {
      toast.success("Booking created successfully");
      utils.booking.getByDateRange.invalidate().catch(() => {
        return;
      });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data: searchResults, isLoading: isSearchingMembers } =
    api.club.searchMembers.useQuery(
      { clubId, query: memberSearchQuery },
      { enabled: memberSearchQuery.length > 2 },
    );

  const filteredSearchResults = searchResults?.filter(
    (member) => member.userId !== currentUserId,
  );

  const endTime = addMinutes(startTime, duration);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDuration(facilityType.bookingIntervalMinutes || 60);
      setParticipants([]);
      setGuestName("");
      setGuestEmail("");
      setMemberSearchQuery("");
    }
  }, [isOpen, facilityType]);

  const handleAddGuest = () => {
    if (!guestName) return;
    setParticipants([
      ...participants,
      { name: guestName, email: guestEmail, isGuest: true },
    ]);
    setGuestName("");
    setGuestEmail("");
  };

  const handleAddMember = (member: {
    userId: string;
    name: string;
    email: string;
  }) => {
    if (participants.some((p) => p.userId === member.userId)) return;
    setParticipants([
      ...participants,
      {
        userId: member.userId,
        name: member.name,
        email: member.email,
        isGuest: false,
      },
    ]);
    setMemberSearchQuery("");
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    createBooking.mutate({
      clubId,
      facilityId: facility.id,
      startTime,
      endTime,
      participants,
    });
  };

  const maxDurationRule = facilityType.rules.find(
    (r) => r.type === "max_duration",
  );

  let maxDuration = 180;
  if (maxDurationRule) {
    // Handle both number (legacy) and object formats
    const val = maxDurationRule.value as number | { minutes: number };
    if (typeof val === "number") {
      maxDuration = val;
    } else if (typeof val === "object" && val !== null && "minutes" in val) {
      maxDuration = Number(val.minutes);
    }
  }

  const getClosingTime = () => {
    const dayOfWeek = format(startTime, "EEEE").toLowerCase();
    const oh = facilityType.openingHours.find(
      (oh) => oh.dayOfWeek === dayOfWeek,
    );
    if (!oh) return endOfDay(startTime);

    const [hours, minutes] = oh.endTime.split(":").map(Number);
    const closingTime = new Date(startTime);
    closingTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
    return closingTime;
  };

  const closingTime = getClosingTime();
  const interval = facilityType.bookingIntervalMinutes || 30;

  const increaseDuration = () => {
    const newDuration = duration + interval;
    const newEndTime = addMinutes(startTime, newDuration);

    if (
      newDuration <= maxDuration &&
      (!closingTime || !isAfter(newEndTime, closingTime))
    ) {
      setDuration(newDuration);
    }
  };

  const decreaseDuration = () => {
    const newDuration = duration - interval;
    if (newDuration >= interval) {
      setDuration(newDuration);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Facility</Label>
              <div className="font-medium">{facility.name}</div>
            </div>
            <div>
              <Label>Date</Label>
              <div className="font-medium">{format(startTime, "PPP")}</div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label>Time</Label>
              <div className="text-lg font-semibold">
                {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseDuration}
                disabled={
                  duration <= (facilityType.bookingIntervalMinutes || 30)
                }
              >
                -
              </Button>
              <span className="w-12 text-center">{duration}m</span>
              <Button
                variant="outline"
                size="icon"
                onClick={increaseDuration}
                disabled={
                  duration >= maxDuration ||
                  (!!closingTime &&
                    isAfter(
                      addMinutes(startTime, duration + interval),
                      closingTime,
                    ))
                }
              >
                +
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Participants</Label>

            {/* Member Search */}
            <div className="relative">
              <div className="flex items-center rounded-md border px-3">
                <Search className="text-muted-foreground mr-2 h-4 w-4" />
                <input
                  className="placeholder:text-muted-foreground flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Search members..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                />
              </div>
              {memberSearchQuery.length > 2 && (
                <div className="bg-popover absolute top-full right-0 left-0 z-50 mt-1 max-h-[200px] overflow-auto rounded-md border shadow-md">
                  {isSearchingMembers ? (
                    <div className="text-muted-foreground p-2 text-center text-sm">
                      Searching...
                    </div>
                  ) : filteredSearchResults &&
                    filteredSearchResults.length > 0 ? (
                    filteredSearchResults.map((member) => (
                      <button
                        key={member.userId}
                        className="hover:bg-accent flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                        onClick={() =>
                          handleAddMember({
                            userId: member.userId,
                            name: member.name,
                            email: member.email,
                          })
                        }
                      >
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {member.email}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm">
                      <p className="text-muted-foreground mb-2">
                        No members found
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setParticipants([
                            ...participants,
                            {
                              name: memberSearchQuery,
                              email: "",
                              isGuest: true,
                            },
                          ]);
                          setMemberSearchQuery("");
                        }}
                      >
                        Add &quot;{memberSearchQuery}&quot; as Guest
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Guest Add */}
            <div className="flex gap-2">
              <Input
                placeholder="Guest Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
              <Button
                variant="secondary"
                onClick={handleAddGuest}
                disabled={!guestName}
              >
                Add Guest
              </Button>
            </div>

            {/* Participant List */}
            <div className="mt-2 space-y-2">
              {participants.map((p, i) => (
                <div
                  key={i}
                  className="bg-muted/50 flex items-center justify-between rounded-md p-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground h-4 w-4" />
                    <span>{p.name ?? p.email}</span>
                    {p.isGuest && (
                      <span className="bg-secondary rounded px-1 text-xs">
                        Guest
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveParticipant(i)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createBooking.isPending}>
            {createBooking.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
