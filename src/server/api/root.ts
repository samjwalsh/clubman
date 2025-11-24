import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { clubRouter } from "@/server/api/routers/club";
import { facilityRouter } from "@/server/api/routers/facility";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    club: clubRouter,
    facility: facilityRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
