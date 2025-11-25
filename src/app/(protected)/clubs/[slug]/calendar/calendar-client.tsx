"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  startOfDay,
  endOfDay,
  isSameDay,
} from "date-fns";
import { type RouterOutputs } from "@/trpc/react";
import { cn } from "@/lib/utils";
import BookingModal from "./_components/booking-modal";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

type FacilityType = RouterOutputs["facility"]["getTypes"][number];
type Facility = FacilityType["facilities"][number];

export default function CalendarClient({
  clubId,
  facilityTypes,
  userId,
}: {
  clubId: string;
  facilityTypes: FacilityType[];
  userId: string;
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const LOCAL_STORAGE_KEY = `clubman:lastFacilityType:${clubId}:${userId}`;
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  // On mount, restore last viewed facility type from localStorage
  useEffect(() => {
    const storedTypeId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedTypeId && facilityTypes.some((t) => t.id === storedTypeId)) {
      setSelectedTypeId(storedTypeId);
    } else {
      setSelectedTypeId(facilityTypes[0]?.id ?? "");
    }
  }, [facilityTypes, clubId, userId, LOCAL_STORAGE_KEY]);

  // Whenever selectedTypeId changes, persist it
  useEffect(() => {
    if (selectedTypeId) {
      localStorage.setItem(LOCAL_STORAGE_KEY, selectedTypeId);
    }
  }, [selectedTypeId, LOCAL_STORAGE_KEY]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalData, setBookingModalData] = useState<{
    facility: Facility;
    startTime: Date;
    bookingId?: string;
    initialDuration?: number;
    initialParticipants?: {
      name?: string;
      email?: string;
      userId?: string;
      isGuest: boolean;
    }[];
  } | null>(null);

  const selectedType = facilityTypes.find((t) => t.id === selectedTypeId);

  const { data: bookings } = api.booking.getByDateRange.useQuery(
    {
      clubId,
      startTime: startOfDay(selectedDate),
      endTime: endOfDay(selectedDate),
      facilityIds: selectedType?.facilities.map((f) => f.id),
    },
    {
      enabled: !!selectedType,
    },
  );

  const handlePreviousDay = () => setSelectedDate((d) => subDays(d, 1));
  const handleNextDay = () => setSelectedDate((d) => addDays(d, 1));
  const handlePreviousWeek = () => setSelectedDate((d) => subWeeks(d, 1));
  const handleNextWeek = () => setSelectedDate((d) => addWeeks(d, 1));
  const handleToday = () => setSelectedDate(new Date());

  const handleSlotClick = (
    facility: Facility,
    startTime: Date,
    booking?: NonNullable<typeof bookings>[number],
  ) => {
    if (isFacilityClosed(facility.id, startTime)) return;

    if (booking) {
      if (booking.userId !== userId) return;

      const duration =
        (new Date(booking.endTime).getTime() -
          new Date(booking.startTime).getTime()) /
        60000;

      setBookingModalData({
        facility,
        startTime: new Date(booking.startTime),
        bookingId: booking.id,
        initialDuration: duration,
        initialParticipants: booking.participants.map((p) => ({
          name: p.guestName ?? undefined,
          email: p.guestEmail ?? undefined,
          userId: p.userId ?? undefined,
          isGuest: p.isGuest ?? false,
        })),
      });
    } else {
      // Check if date is in the past
      if (startTime < new Date()) {
        // Optional: Allow admins to book in past? For now, just return.
        // return;
      }

      setBookingModalData({ facility, startTime });
    }
    setIsBookingModalOpen(true);
  };

  const isFacilityClosed = (facilityId: string, date: Date) => {
    if (!selectedType?.closures) return false;

    return selectedType.closures.some((closure) => {
      const start = new Date(closure.startDate);
      const end = new Date(closure.endDate);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const inRange = checkDate >= start && checkDate <= end;
      if (!inRange) return false;

      if (closure.facilityId && closure.facilityId !== facilityId) return false;

      return true;
    });
  };
  if (!selectedType) {
    return <div>No facility types found.</div>;
  }

  // Generate time slots
  const interval = selectedType.bookingIntervalMinutes || 60;

  let startHour = 24;
  let endHour = 0;

  if (selectedType.openingHours && selectedType.openingHours.length > 0) {
    selectedType.openingHours.forEach((oh) => {
      const startH = parseInt(oh.startTime.split(":")[0] ?? "6");
      if (startH < startHour) startHour = startH;

      const [endHStr, endMStr] = oh.endTime.split(":");
      let endH = parseInt(endHStr ?? "23");
      const endM = parseInt(endMStr ?? "0");

      if (endM > 0) endH += 1;
      if (endH > endHour) endHour = endH;
    });
  }

  // Fallback defaults
  if (startHour === 24) startHour = 6;
  if (endHour === 0) endHour = 23;

  const timeSlots: Date[] = [];
  let currentTime = startOfDay(selectedDate);
  currentTime.setHours(startHour);
  const endTime = startOfDay(selectedDate);
  endTime.setHours(endHour);

  while (currentTime < endTime) {
    timeSlots.push(new Date(currentTime));
    currentTime = new Date(currentTime.getTime() + interval * 60000);
  }

  const ROW_HEIGHT = 60; // px
  const pixelsPerMinute = ROW_HEIGHT / interval;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[250px] justify-between">
                {selectedType.name}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[250px]">
              {facilityTypes.map((type) => (
                <DropdownMenuItem
                  key={type.id}
                  onSelect={() => setSelectedTypeId(type.id)}
                >
                  {type.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={handleToday}
            disabled={isSameDay(selectedDate, new Date())}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handlePreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "min-w-[180px] justify-center font-normal",
                  !selectedDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "eee, MMM d, yyyy")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-background flex-1 overflow-auto rounded-md border shadow-sm">
        <div className={cn("flex flex-col")}>
          {/* Header Row */}
          <div className="bg-background w- sticky top-0 z-20 flex">
            <div className="bg-muted/50 w-20 shrink-0 border-r border-b p-2"></div>
            {selectedType.facilities.map((facility) => (
              <div
                key={facility.id}
                className="bg-muted/50 min-w-[150px] flex-1 border-r border-b p-3 text-center font-semibold last:border-r-0"
              >
                {facility.name}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="relative flex">
            {/* Time Labels */}
            <div className="bg-background z-10 w-20 shrink-0">
              {timeSlots.map((slot) => (
                <div
                  key={slot.toISOString()}
                  className="text-foreground flex items-start justify-end border-r border-b p-2 pt-2 text-right text-sm"
                  style={{ height: ROW_HEIGHT }}
                >
                  {format(slot, "HH:mm")}
                </div>
              ))}
            </div>

            {/* Facilities Columns */}
            <div className="flex flex-1">
              {selectedType.facilities.map((facility) => (
                <div
                  key={facility.id}
                  className="relative min-w-[150px] flex-1 border-r last:border-r-0"
                >
                  {/* Calendar Blocks */}
                  {timeSlots.map((slot) => (
                    <>
                      {bookings === undefined && (
                        <Skeleton
                          key={slot.toISOString()}
                          className="w-full rounded-none border-b transition-colors"
                          style={{ height: ROW_HEIGHT }}
                        />
                      )}
                      {bookings !== undefined && (
                        <div
                          key={slot.toISOString()}
                          className={cn(
                            "w-full border-b transition-colors",
                            isFacilityClosed(facility.id, slot)
                              ? "cursor-not-allowed bg-gray-100 dark:bg-gray-800/50"
                              : slot < new Date()
                                ? "bg-muted/50 cursor-not-allowed"
                                : "hover:bg-accent cursor-pointer",
                          )}
                          style={{ height: ROW_HEIGHT }}
                          onClick={() => handleSlotClick(facility, slot)}
                        />
                      )}
                    </>
                  ))}

                  {/* Bookings */}
                  {bookings
                    ?.filter((b) => b.facilityId === facility.id)
                    .map((booking) => {
                      if (booking.status === "cancelled") return;
                      const start = new Date(booking.startTime);
                      const end = new Date(booking.endTime);

                      const dayStart = new Date(selectedDate);
                      dayStart.setHours(startHour, 0, 0, 0);

                      // Calculate offset from start of the grid (startHour)
                      const startDiffMinutes =
                        (start.getTime() - dayStart.getTime()) / 60000;
                      const durationMinutes =
                        (end.getTime() - start.getTime()) / 60000;

                      const top = Math.max(
                        0,
                        startDiffMinutes * pixelsPerMinute,
                      );
                      const height = durationMinutes * pixelsPerMinute;

                      return (
                        <div
                          key={booking.id}
                          className={cn(
                            "absolute right-0 left-0 flex flex-wrap content-start gap-2 overflow-hidden rounded-md border p-2 text-xs shadow-sm transition-all hover:z-10",
                            booking.status === "booked" &&
                              "bg-primary/10 border-primary/20 text-primary",
                            booking.type === "maintenance" &&
                              "border-orange-200 bg-orange-100 text-orange-800",
                            booking.type === "coaching_session" &&
                              "border-blue-200 bg-blue-100 text-blue-800",
                          )}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSlotClick(facility, start, booking);
                          }}
                        >
                          <div className="truncate font-semibold">
                            {booking.user.name}
                          </div>
                          <div className="truncate opacity-80">
                            {format(start, "HH:mm")} - {format(end, "HH:mm")}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isBookingModalOpen && bookingModalData && selectedType && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          clubId={clubId}
          facility={bookingModalData.facility}
          facilityType={selectedType}
          startTime={bookingModalData.startTime}
          currentUserId={userId}
          bookingId={bookingModalData.bookingId}
          initialDuration={bookingModalData.initialDuration}
          initialParticipants={bookingModalData.initialParticipants}
          onSuccess={() => {
            // Refresh bookings handled by invalidation in modal
          }}
        />
      )}
    </div>
  );
}
