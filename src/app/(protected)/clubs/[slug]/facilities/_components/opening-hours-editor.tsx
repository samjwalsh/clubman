"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { type FacilityType } from "./types";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export function OpeningHoursEditor({ type }: { type: FacilityType }) {
  const utils = api.useUtils();
  const [hours, setHours] = useState<
    Record<string, { isOpen: boolean; start: string; end: string }>
  >({});

  useEffect(() => {
    const initialHours: typeof hours = {};
    DAYS.forEach((day) => {
      const existing = type.openingHours.find((h) => h.dayOfWeek === day);
      initialHours[day] = {
        isOpen: !!existing,
        start: existing?.startTime ?? "09:00",
        end: existing?.endTime ?? "17:00",
      };
    });
    setHours(initialHours);
  }, [type.openingHours]);

  const updateOpeningHours = api.facility.updateOpeningHours.useMutation({
    onSuccess: async () => {
      await utils.facility.getTypes.invalidate();
      toast.success("Opening hours updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    const payload = DAYS.filter((day) => hours[day]?.isOpen).map((day) => ({
      dayOfWeek: day,
      startTime: hours[day]!.start,
      endTime: hours[day]!.end,
    }));

    updateOpeningHours.mutate({
      facilityTypeId: type.id,
      hours: payload,
    });
  };

  const updateDay = (
    day: string,
    field: "isOpen" | "start" | "end",
    value: string | boolean
  ) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day]!,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {DAYS.map((day) => (
          <div key={day} className="flex items-center gap-4">
            <div className="w-24 font-medium capitalize">{day}</div>
            <Switch
              checked={hours[day]?.isOpen ?? false}
              onCheckedChange={(checked) => updateDay(day, "isOpen", checked)}
            />
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={hours[day]?.start ?? "09:00"}
                onChange={(e) => updateDay(day, "start", e.target.value)}
                disabled={!hours[day]?.isOpen}
                className="w-32"
              />
              <span>to</span>
              <Input
                type="time"
                value={hours[day]?.end ?? "17:00"}
                onChange={(e) => updateDay(day, "end", e.target.value)}
                disabled={!hours[day]?.isOpen}
                className="w-32"
              />
            </div>
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={updateOpeningHours.isPending}>
        {updateOpeningHours.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Save Opening Hours
      </Button>
    </div>
  );
}
