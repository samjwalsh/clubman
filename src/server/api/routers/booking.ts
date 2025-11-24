import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
    booking,
    bookingParticipant,
    bookingRule,
    facility,
    facilityClosure,
    facilityOpeningHours,
    membership,
} from "@/server/db/schema";
import { and, eq, gte, lte, or, lt, gt, inArray, ne } from "drizzle-orm";

const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
] as const;

export const bookingRouter = createTRPCRouter({
    getByDateRange: protectedProcedure
        .input(z.object({
            clubId: z.string(),
            startTime: z.date(),
            endTime: z.date(),
            facilityIds: z.array(z.string()).optional(),
        }))
        .query(async ({ ctx, input }) => {
            const { db } = ctx;
            const { clubId, startTime, endTime, facilityIds } = input;

            return db.query.booking.findMany({
                where: and(
                    eq(booking.clubId, clubId),
                    lt(booking.startTime, endTime),
                    gt(booking.endTime, startTime),
                    facilityIds && facilityIds.length > 0 ? inArray(booking.facilityId, facilityIds) : undefined
                ),
                with: {
                    user: true,
                    participants: true,
                }
            });
        }),

    create: protectedProcedure
        .input(
            z.object({
                clubId: z.string(),
                facilityId: z.string(),
                startTime: z.date(),
                endTime: z.date(),
                type: z.enum(["user_booking", "coaching_session", "maintenance", "block"]).default("user_booking"),
                participants: z.array(z.object({
                    name: z.string().optional(),
                    email: z.string().optional(),
                    userId: z.string().optional(),
                    isGuest: z.boolean().default(false),
                })).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const { clubId, facilityId, startTime, endTime, type, participants } = input;

            // 0. Check membership
            const userMembership = await db.query.membership.findFirst({
                where: and(
                    eq(membership.userId, session.user.id),
                    eq(membership.clubId, clubId),
                    eq(membership.status, "active")
                )
            });

            if (!userMembership) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You must be an active member of this club to create a booking",
                });
            }

            // 1. Check if time is in the past
            if (startTime < new Date()) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Cannot book in the past",
                });
            }

            if (endTime <= startTime) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "End time must be after start time",
                });
            }

            // Fetch facility and its type
            const facilityData = await db.query.facility.findFirst({
                where: eq(facility.id, facilityId),
                with: {
                    type: true,
                },
            });

            if (!facilityData) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Facility not found",
                });
            }

            // 2. Check closures
            const bookingDateStr = startTime.toISOString().split('T')[0];
            if (!bookingDateStr) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Invalid date format",
                });
            }

            const closures = await db.query.facilityClosure.findMany({
                where: and(
                    eq(facilityClosure.clubId, clubId),
                    or(
                        eq(facilityClosure.facilityId, facilityId),
                        eq(facilityClosure.facilityTypeId, facilityData.facilityTypeId)
                    ),
                    lte(facilityClosure.startDate, bookingDateStr),
                    gte(facilityClosure.endDate, bookingDateStr)
                )
            });

            if (closures.length > 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Facility is closed on this date",
                });
            }

            // 3. Check opening hours
            const dayName = daysOfWeek[startTime.getDay()];
            if (!dayName) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Invalid day of week",
                });
            }

            const openingHours = await db.query.facilityOpeningHours.findMany({
                where: and(
                    eq(facilityOpeningHours.dayOfWeek, dayName),
                    or(
                        eq(facilityOpeningHours.facilityId, facilityId),
                        eq(facilityOpeningHours.facilityTypeId, facilityData.facilityTypeId)
                    )
                )
            });

            if (openingHours.length === 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Facility is closed on this day",
                });
            }

            // Check if booking time is within any of the opening hours slots
            // We need to compare time strings "HH:MM:SS"
            const bookingStartTimeStr = startTime.toTimeString().split(' ')[0];
            const bookingEndTimeStr = endTime.toTimeString().split(' ')[0];

            if (!bookingStartTimeStr || !bookingEndTimeStr) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Invalid time format",
                });
            }

            // Helper to convert "HH:MM:SS" to minutes from midnight for easier comparison
            const toMinutes = (timeStr: string) => {
                const parts = timeStr.split(':');
                const h = Number(parts[0]);
                const m = Number(parts[1]);
                return h * 60 + m;
            };

            const startMinutes = toMinutes(bookingStartTimeStr);
            const endMinutes = toMinutes(bookingEndTimeStr);

            const isOpen = openingHours.some(oh => {
                const ohStart = toMinutes(oh.startTime);
                const ohEnd = toMinutes(oh.endTime);
                return startMinutes >= ohStart && endMinutes <= ohEnd;
            });

            if (!isOpen) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Booking time is outside opening hours",
                });
            }

            // 4. Check max duration rule
            const rules = await db.query.bookingRule.findMany({
                where: and(
                    eq(bookingRule.clubId, clubId),
                    eq(bookingRule.facilityTypeId, facilityData.facilityTypeId),
                    eq(bookingRule.type, "max_duration")
                )
            });

            if (rules.length > 0 && rules[0]) {
                const rule = rules[0];
                const val = rule.value;
                let maxMinutes = 0;

                if (typeof val === 'number') {
                    maxMinutes = val;
                } else if (typeof val === 'object' && val !== null && 'minutes' in val) {
                    maxMinutes = Number((val as { minutes: unknown }).minutes);
                }

                if (maxMinutes > 0) {
                    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

                    if (durationMinutes > maxMinutes) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: `Booking exceeds maximum duration of ${maxMinutes} minutes`,
                        });
                    }
                }
            }

            // 5. Check for overlapping bookings
            const overlappingBookings = await db.query.booking.findFirst({
                where: and(
                    eq(booking.facilityId, facilityId),
                    eq(booking.status, "booked"),
                    lt(booking.startTime, endTime),
                    gt(booking.endTime, startTime)
                )
            });

            if (overlappingBookings) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Facility is already booked for this time slot",
                });
            }

            // 6. Create booking
            const [newBooking] = await db.insert(booking).values({
                id: crypto.randomUUID(),
                clubId,
                facilityId,
                userId: session.user.id,
                startTime,
                endTime,
                status: "booked",
                type,
            }).returning();

            if (newBooking && participants && participants.length > 0) {
                await db.insert(bookingParticipant).values(
                    participants.map((p) => ({
                        bookingId: newBooking.id,
                        userId: p.userId,
                        guestName: p.name,
                        guestEmail: p.email,
                        isGuest: p.isGuest,
                    }))
                );
            }

            return newBooking;
        }),

    cancel: protectedProcedure
        .input(z.object({ bookingId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const { bookingId } = input;

            const existingBooking = await db.query.booking.findFirst({
                where: eq(booking.id, bookingId),
                with: {
                    facility: {
                        with: {
                            type: true
                        }
                    }
                }
            });

            if (!existingBooking) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
            }

            if (existingBooking.userId !== session.user.id) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to cancel this booking" });
            }

            // Check cancellation window
            const rules = await db.query.bookingRule.findMany({
                where: and(
                    eq(bookingRule.clubId, existingBooking.clubId),
                    eq(bookingRule.facilityTypeId, existingBooking.facility.facilityTypeId),
                    eq(bookingRule.type, "cancellation_window")
                )
            });

            if (rules.length > 0 && rules[0]) {
                const rule = rules[0];
                const val = rule.value;
                let hours = 0;

                if (typeof val === 'number') {
                    hours = val;
                } else if (typeof val === 'object' && val !== null && 'hours' in val) {
                    hours = Number((val as { hours: unknown }).hours);
                }

                const now = new Date();
                const diffHours = (existingBooking.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

                if (diffHours < hours) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: `Cannot cancel within ${hours} hours of start time`,
                    });
                }
            }

            const [updatedBooking] = await db.update(booking)
                .set({ status: "cancelled" })
                .where(eq(booking.id, bookingId))
                .returning();

            return updatedBooking;
        }),

    update: protectedProcedure
        .input(
            z.object({
                bookingId: z.string(),
                startTime: z.date(),
                endTime: z.date(),
                participants: z.array(z.object({
                    name: z.string().optional(),
                    email: z.string().optional(),
                    userId: z.string().optional(),
                    isGuest: z.boolean().default(false),
                })).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const { bookingId, startTime, endTime, participants } = input;

            const existingBooking = await db.query.booking.findFirst({
                where: eq(booking.id, bookingId),
                with: {
                    facility: {
                        with: {
                            type: true
                        }
                    }
                }
            });

            if (!existingBooking) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
            }

            if (existingBooking.userId !== session.user.id) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to edit this booking" });
            }

            if (existingBooking.startTime < new Date()) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Cannot edit past bookings",
                });
            }

            // Check cancellation/edit window
            const rules = await db.query.bookingRule.findMany({
                where: and(
                    eq(bookingRule.clubId, existingBooking.clubId),
                    eq(bookingRule.facilityTypeId, existingBooking.facility.facilityTypeId),
                    eq(bookingRule.type, "cancellation_window")
                )
            });

            if (rules.length > 0 && rules[0]) {
                const rule = rules[0];
                const val = rule.value;
                let hours = 0;

                if (typeof val === 'number') {
                    hours = val;
                } else if (typeof val === 'object' && val !== null && 'hours' in val) {
                    hours = Number((val as { hours: unknown }).hours);
                }

                const now = new Date();
                const diffHours = (existingBooking.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

                if (diffHours < hours) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: `Cannot edit within ${hours} hours of start time`,
                    });
                }
            }

            // Validate new time constraints
            const facilityId = existingBooking.facilityId;
            const clubId = existingBooking.clubId;
            const facilityData = existingBooking.facility;

            // 1. Check closures
            const bookingDateStr = startTime.toISOString().split('T')[0];
            if (!bookingDateStr) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Invalid date" });

            const closures = await db.query.facilityClosure.findMany({
                where: and(
                    eq(facilityClosure.clubId, clubId),
                    or(
                        eq(facilityClosure.facilityId, facilityId),
                        eq(facilityClosure.facilityTypeId, facilityData.facilityTypeId)
                    ),
                    lte(facilityClosure.startDate, bookingDateStr),
                    gte(facilityClosure.endDate, bookingDateStr)
                )
            });

            if (closures.length > 0) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Facility is closed on this date" });
            }

            // 2. Check opening hours
            const dayName = daysOfWeek[startTime.getDay()];
            if (!dayName) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Invalid day" });

            const openingHours = await db.query.facilityOpeningHours.findMany({
                where: and(
                    eq(facilityOpeningHours.dayOfWeek, dayName),
                    or(
                        eq(facilityOpeningHours.facilityId, facilityId),
                        eq(facilityOpeningHours.facilityTypeId, facilityData.facilityTypeId)
                    )
                )
            });

            if (openingHours.length === 0) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Facility is closed on this day" });
            }

            const bookingStartTimeStr = startTime.toTimeString().split(' ')[0];
            const bookingEndTimeStr = endTime.toTimeString().split(' ')[0];
            if (!bookingStartTimeStr || !bookingEndTimeStr) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Invalid time" });

            const toMinutes = (timeStr: string) => {
                const parts = timeStr.split(':');
                return Number(parts[0]) * 60 + Number(parts[1]);
            };

            const startMinutes = toMinutes(bookingStartTimeStr);
            const endMinutes = toMinutes(bookingEndTimeStr);

            const isOpen = openingHours.some(oh => {
                const ohStart = toMinutes(oh.startTime);
                const ohEnd = toMinutes(oh.endTime);
                return startMinutes >= ohStart && endMinutes <= ohEnd;
            });

            if (!isOpen) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Booking time is outside opening hours" });
            }

            // 3. Check max duration
            const durationRules = await db.query.bookingRule.findMany({
                where: and(
                    eq(bookingRule.clubId, clubId),
                    eq(bookingRule.facilityTypeId, facilityData.facilityTypeId),
                    eq(bookingRule.type, "max_duration")
                )
            });

            if (durationRules.length > 0 && durationRules[0]) {
                const rule = durationRules[0];
                const val = rule.value;
                let maxMinutes = 0;
                if (typeof val === 'number') maxMinutes = val;
                else if (typeof val === 'object' && val !== null && 'minutes' in val) maxMinutes = Number((val as { minutes: unknown }).minutes);

                if (maxMinutes > 0) {
                    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
                    if (durationMinutes > maxMinutes) {
                        throw new TRPCError({ code: "BAD_REQUEST", message: `Booking exceeds maximum duration of ${maxMinutes} minutes` });
                    }
                }
            }

            // 4. Check overlaps (excluding current booking)
            const overlappingBookings = await db.query.booking.findFirst({
                where: and(
                    eq(booking.facilityId, facilityId),
                    eq(booking.status, "booked"),
                    lt(booking.startTime, endTime),
                    gt(booking.endTime, startTime),
                    ne(booking.id, bookingId)
                )
            });

            if (overlappingBookings) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Facility is already booked for this time slot",
                });
            }

            // 5. Update booking
            const [updatedBooking] = await db.update(booking)
                .set({
                    startTime,
                    endTime,
                })
                .where(eq(booking.id, bookingId))
                .returning();

            // 6. Update participants
            if (participants) {
                // Delete existing
                await db.delete(bookingParticipant).where(eq(bookingParticipant.bookingId, bookingId));

                // Insert new
                if (participants.length > 0) {
                    await db.insert(bookingParticipant).values(
                        participants.map((p) => ({
                            bookingId: bookingId,
                            userId: p.userId,
                            guestName: p.name,
                            guestEmail: p.email,
                            isGuest: p.isGuest,
                        }))
                    );
                }
            }

            return updatedBooking;
        }),
});
