"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { type FacilityType } from "./types";

export function BookingRulesEditor({ type }: { type: FacilityType }) {
  const utils = api.useUtils();
  const [bookingInterval, setBookingInterval] = useState<string>("");
  const [maxDuration, setMaxDuration] = useState<string>("");
  const [cancellationWindow, setCancellationWindow] = useState<string>("");
  const [guestFee, setGuestFee] = useState<string>("");

  useEffect(() => {
    const maxDurationRule = type.rules.find((r) => r.type === "max_duration");
    const cancellationRule = type.rules.find(
      (r) => r.type === "cancellation_window",
    );
    const guestFeeRule = type.rules.find((r) => r.type === "guest_fee");

    setBookingInterval(type.bookingIntervalMinutes.toString());

    // Handle both number and object formats
    const getMaxVal = (r: typeof maxDurationRule) => {
      if (!r) return "";
      const val = r.value;
      if (typeof val === "number") return val.toString();
      if (typeof val === "object" && val !== null) {
        if ("minutes" in val) return String(val.minutes);
        if ("hours" in val) return String(val.hours);
        if ("amount" in val) return String(val.amount);
      }
      return "";
    };

    setMaxDuration(getMaxVal(maxDurationRule));
    setCancellationWindow(getMaxVal(cancellationRule));
    setGuestFee(getMaxVal(guestFeeRule));
  }, [type.rules, type.bookingIntervalMinutes]);

  const updateRules = api.facility.updateBookingRules.useMutation({
    onSuccess: async () => {
      await utils.facility.getTypes.invalidate();
      toast.success("Booking rules updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    const rules = [];

    if (maxDuration) {
      rules.push({
        type: "max_duration" as const,
        value: { minutes: parseInt(maxDuration) },
      });
    }
    if (cancellationWindow) {
      rules.push({
        type: "cancellation_window" as const,
        value: { hours: parseInt(cancellationWindow) },
      });
    }
    if (guestFee) {
      rules.push({
        type: "guest_fee" as const,
        value: { amount: parseFloat(guestFee) },
      });
    }

    updateRules.mutate({
      facilityTypeId: type.id,
      bookingIntervalMinutes: parseInt(bookingInterval),
      rules,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="bookingInterval">Booking Interval (minutes)</Label>
          <Input
            id="bookingInterval"
            type="number"
            value={bookingInterval}
            onChange={(e) => setBookingInterval(e.target.value)}
            placeholder="e.g. 30"
            min="15"
            step="15"
          />
          <p className="text-muted-foreground text-sm">
            The duration of each booking slot.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="maxDuration">Max Booking Duration (minutes)</Label>
          <Input
            id="maxDuration"
            type="number"
            value={maxDuration}
            onChange={(e) => setMaxDuration(e.target.value)}
            placeholder="e.g. 120"
          />
          <p className="text-muted-foreground text-sm">
            Maximum time a user can book in a single session.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cancellationWindow">
            Cancellation Window (hours)
          </Label>
          <Input
            id="cancellationWindow"
            type="number"
            value={cancellationWindow}
            onChange={(e) => setCancellationWindow(e.target.value)}
            placeholder="e.g. 24"
          />
          <p className="text-muted-foreground text-sm">
            Minimum hours before booking start time to allow cancellation.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="guestFee">Guest Fee ($)</Label>
          <Input
            id="guestFee"
            type="number"
            value={guestFee}
            onChange={(e) => setGuestFee(e.target.value)}
            placeholder="e.g. 10.00"
            step="0.01"
          />
          <p className="text-muted-foreground text-sm">
            Fee charged for each guest added to a booking.
          </p>
        </div>
      </div>

      <Button onClick={handleSave} disabled={updateRules.isPending}>
        {updateRules.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Save Rules
      </Button>
    </div>
  );
}
