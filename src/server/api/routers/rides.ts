import { createTRPCRouter, publicProcedure } from '@goober/server/api/trpc';
import { RideStatus, type Ride } from '@prisma/client';
import { z } from 'zod';

import pusher from '../../lib/pusher'

const idSchema = z.object({ id: z.string() });

export const ridesRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }): Promise<Ride[] | null> => {
    const rides = await ctx.db.ride.findMany({
      where: { status: RideStatus.PENDING }
    });
    return rides;
  }),

  create: publicProcedure
    .input(z.object({ 
      userId: z.string(), 
      driverId: z.string().optional(), // Optional for creation
      price: z.number(), 
      distance: z.number(), 
      estimatedTime: z.number(),
      pickupAddress: z.string(),
      pickupLong: z.number(),
      pickupLat: z.number(),
      dropoffAddress: z.string(),
      dropoffLat: z.number(),
      dropoffLong: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const newRide = await ctx.db.ride.create({
        data: {
          userId: input.userId, 
          driverId: input.driverId,
          price: input.price, 
          distance: input.distance, 
          estimatedTime: input.estimatedTime,
          pickupAddress: input.pickupAddress,
          pickupLong: input.pickupLong,
          pickupLat: input.pickupLat,
          dropoffAddress: input.dropoffAddress,
          dropoffLat: input.dropoffLat,
          dropoffLong: input.dropoffLong,
          status: RideStatus.PENDING,
        }
      });

      await pusher.trigger("goober", "ride", newRide);

      return newRide;
    }),

  cancel: publicProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const ride = await ctx.db.ride.update({
        where: { id: input.id },
        data: { status: RideStatus.CANCELLED }
      });
      return ride;
    }),

  acceptAsDriver: publicProcedure
    .input(z.object({ rideId: z.string(), driverId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ride = await ctx.db.ride.update({
        where: { id: input.rideId },
        data: {
          driverId: input.driverId,
          status: RideStatus.IN_PROGRESS,
        }
      });
      return ride;
    }),

  finish: publicProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const ride = await ctx.db.ride.update({
        where: { id: input.id },
        data: { status: RideStatus.FINISHED }
      });
      return ride;
    }),
});
