import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { facility, facilityType, membership } from "@/server/db/schema";
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
                },
            });
        }),

    createType: protectedProcedure
        .input(
            z.object({
                clubId: z.string(),
                name: z.string().min(1),
                bookingIntervalMinutes: z.number().min(15).default(30),
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
                    bookingIntervalMinutes: input.bookingIntervalMinutes,
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
                bookingIntervalMinutes: z.number().min(15).optional(),
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
                    bookingIntervalMinutes: input.bookingIntervalMinutes,
                })
                .where(eq(facilityType.id, input.id))
                .returning();
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1),
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
                })
                .where(eq(facility.id, input.id))
                .returning();
        }),
});
