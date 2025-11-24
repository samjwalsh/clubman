import { type RouterOutputs } from "@/trpc/react";

export type FacilityType = RouterOutputs["facility"]["getTypes"][number];
export type Facility = FacilityType["facilities"][number];
