import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { club, membership, user } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const clubRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                logoUrl: z.string().optional(),
                settings: z.record(z.unknown()).optional(),
                slug: z.string()
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Check if user is admin
            const dbUser = await ctx.db.query.user.findFirst({
                where: eq(user.id, ctx.session.user.id),
            });

            if (!dbUser?.admin) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only admins can create clubs",
                });
            }

            const [newClub] = await ctx.db
                .insert(club)
                .values({
                    id: randomUUID(),
                    name: input.name,
                    logoUrl: input.logoUrl,
                    settings: input.settings,
                    slug: input.slug
                })
                .returning();

            if (!newClub) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create club",
                })
            }

            await ctx.db.insert(membership).values({ clubId: newClub.id, userId: ctx.session.user.id, role: "owner" })

            return newClub;
        }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        const memberships = await ctx.db.query.membership.findMany({
            where: eq(membership.userId, ctx.session.user.id),
            with: {
                club: true,
            },
        });
        return memberships.map((m) => ({
            ...m.club,
            role: m.role,
        }));
    }),

    getBySlug: protectedProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ ctx, input }) => {
            const clubData = await ctx.db.query.club.findFirst({
                where: eq(club.slug, input.slug),
            });

            if (!clubData) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Club not found",
                });
            }

            return clubData;
        }),
});
