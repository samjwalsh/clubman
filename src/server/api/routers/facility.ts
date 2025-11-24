import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
    facility,
    facilityType,
    membership,
    facilityOpeningHours,
    bookingRule,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export const facilityRouter = createTRPCRouter({
    getTypes: protectedProcedure
        .input(z.object({ clubId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.query.facilityType.findMany({
                where: eq(facilityType.clubId, input.clubId),
                with: {
                    facilities: true,
                    openingHours: true,
                    rules: true,
                    closures: true,
                },
            });
        }),

    createType: protectedProcedure
        .input(
            z.object({
                clubId: z.string(),
                name: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userMembership = await ctx.db.query.membership.findFirst({
                where: and(
                    eq(membership.clubId, input.clubId),
                    eq(membership.userId, ctx.session.user.id),
                ),
            });

            if (
                !userMembership ||
                !["owner", "admin"].includes(userMembership.role)
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You do not have permission to manage facilities for this club",
                });
            }

            return ctx.db
                .insert(facilityType)
                .values({
                    id: randomUUID(),
                    clubId: input.clubId,
                    name: input.name,
                })
                .returning();
        }),

    deleteType: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const type = await ctx.db.query.facilityType.findFirst({
                where: eq(facilityType.id, input.id),
            });

            if (!type) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Facility type not found",
                });
            }

            const userMembership = await ctx.db.query.membership.findFirst({
                where: and(
                    eq(membership.clubId, type.clubId),
                    eq(membership.userId, ctx.session.user.id),
                ),
            });

            if (
                !userMembership ||
                !["owner", "admin"].includes(userMembership.role)
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You do not have permission to manage facilities for this club",
                });
            }

            await ctx.db.delete(facilityType).where(eq(facilityType.id, input.id));
            return { success: true };
        }),

    create: protectedProcedure
        .input(
            z.object({
                clubId: z.string(),
                facilityTypeId: z.string(),
                name: z.string().min(1),
                capacity: z.number().min(1).default(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userMembership = await ctx.db.query.membership.findFirst({
                where: and(
                    eq(membership.clubId, input.clubId),
                    eq(membership.userId, ctx.session.user.id),
                ),
            });

            if (
                !userMembership ||
                !["owner", "admin"].includes(userMembership.role)
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You do not have permission to manage facilities for this club",
                });
            }

            return ctx.db
                .insert(facility)
                .values({
                    id: randomUUID(),
                    clubId: input.clubId,
                    facilityTypeId: input.facilityTypeId,
                    name: input.name,
                    capacity: input.capacity,
                })
                .returning();
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const fac = await ctx.db.query.facility.findFirst({
                where: eq(facility.id, input.id),
            });

            if (!fac) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Facility not found",
                });
            }

            const userMembership = await ctx.db.query.membership.findFirst({
                where: and(
                    eq(membership.clubId, fac.clubId),
                    eq(membership.userId, ctx.session.user.id),
                ),
            });

            if (
                !userMembership ||
                !["owner", "admin"].includes(userMembership.role)
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You do not have permission to manage facilities for this club",
                });
            }

            await ctx.db.delete(facility).where(eq(facility.id, input.id));
            return { success: true };
        }),

    updateType: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const type = await ctx.db.query.facilityType.findFirst({
                where: eq(facilityType.id, input.id),
            });

            if (!type) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Facility type not found",
                });
            }

            const userMembership = await ctx.db.query.membership.findFirst({
                where: and(
                    eq(membership.clubId, type.clubId),
                    eq(membership.userId, ctx.session.user.id),
                ),
            });

            if (
                !userMembership ||
                !["owner", "admin"].includes(userMembership.role)
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You do not have permission to manage facilities for this club",
                });
            }

            return ctx.db
                .update(facilityType)
                .set({
                    name: input.name,
                })
                .where(eq(facilityType.id, input.id))
                .returning();
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1).optional(),
                capacity: z.number().min(1).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const fac = await ctx.db.query.facility.findFirst({
                where: eq(facility.id, input.id),
            });

            if (!fac) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Facility not found",
                });
            }

            const userMembership = await ctx.db.query.membership.findFirst({
                where: and(
                    eq(membership.clubId, fac.clubId),
                    eq(membership.userId, ctx.session.user.id),
                ),
            });

            if (
                !userMembership ||
                !["owner", "admin"].includes(userMembership.role)
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You do not have permission to manage facilities for this club",
                });
            }

            return ctx.db
                .update(facility)
                .set({
                    name: input.name,
                    capacity: input.capacity,
                })
                .where(eq(facility.id, input.id))
                .returning();
        }),

    updateOpeningHours: protectedProcedure
        .input(
            z.object({
                facilityTypeId: z.string(),
                hours: z.array(
                    z.object({
                        dayOfWeek: z.enum([
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                            "sunday",
                        ]),
                        startTime: z.string(),
                        endTime: z.string(),
                    })
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const type = await ctx.db.query.facilityType.findFirst({
                where: eq(facilityType.id, input.facilityTypeId),
            });

            if (!type) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Facility type not found",
                });
            }

            const userMembership = await ctx.db.query.membership.findFirst({
                where: and(
                    eq(membership.clubId, type.clubId),
                    eq(membership.userId, ctx.session.user.id)
                ),
            });

            if (
                !userMembership ||
                !["owner", "admin"].includes(userMembership.role)
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You do not have permission to manage facilities for this club",
                });
            }

            // Delete existing hours
            await ctx.db
                .delete(facilityOpeningHours)
                .where(eq(facilityOpeningHours.facilityTypeId, input.facilityTypeId));

            // Insert new hours
            if (input.hours.length > 0) {
                await ctx.db.insert(facilityOpeningHours).values(
                    input.hours.map((h) => ({
                        id: randomUUID(),
                        facilityTypeId: input.facilityTypeId,
                        dayOfWeek: h.dayOfWeek,
                        startTime: h.startTime,
                        endTime: h.endTime,
                    }))
                );
            }

            return { success: true };
        }),

    updateBookingRules: protectedProcedure
        .input(
            z.object({
                facilityTypeId: z.string(),
                bookingIntervalMinutes: z.number().min(15).optional(),
                rules: z.array(
                    z.object({
                        type: z.enum(["max_duration", "cancellation_window", "guest_fee"]),
                        value: z.any(),
                    })
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const type = await ctx.db.query.facilityType.findFirst({
                where: eq(facilityType.id, input.facilityTypeId),
            });

            if (!type) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Facility type not found",
                });
            }

            const userMembership = await ctx.db.query.membership.findFirst({
                where: and(
                    eq(membership.clubId, type.clubId),
                    eq(membership.userId, ctx.session.user.id)
                ),
            });

            if (
                !userMembership ||
                !["owner", "admin"].includes(userMembership.role)
            ) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You do not have permission to manage facilities for this club",
                });
            }

            // Update booking interval if provided
            if (input.bookingIntervalMinutes) {
                await ctx.db
                    .update(facilityType)
                    .set({ bookingIntervalMinutes: input.bookingIntervalMinutes })
                    .where(eq(facilityType.id, input.facilityTypeId));
            }

            // Delete existing rules
            await ctx.db
                .delete(bookingRule)
                .where(eq(bookingRule.facilityTypeId, input.facilityTypeId));

            // Insert new rules
            if (input.rules.length > 0) {
                await ctx.db.insert(bookingRule).values(
                    input.rules.map((r) => ({
                        id: randomUUID(),
                        clubId: type.clubId,
                        facilityTypeId: input.facilityTypeId,
                        type: r.type,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        value: r.value,
                    }))
                );
            }

            return { success: true };
        }),
});
