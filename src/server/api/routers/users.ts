import { createTRPCRouter, publicProcedure } from '@goober/server/api/trpc';
import { type User, UserRole } from '@prisma/client';
import { z } from 'zod';

const idSchema = z.object({ id: z.string()})

export const usersRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }): Promise<User | null> => {
    const user = await ctx.db.user.findFirst();
    return user;
  }),

  getById: publicProcedure
    .input(idSchema)
    .query(async ({ ctx, input }): Promise<User | null> => {
      const user = await ctx.db.user.findUnique({
        where: idSchema.parse(input),
      });
      return user;
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(2), role: z.nativeEnum(UserRole) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.create({
        data: {
          name: input.name,
          role: input.role,
        }
      });
    }),
});