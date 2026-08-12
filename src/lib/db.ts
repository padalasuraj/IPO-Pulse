// Lazy Prisma access.
//
// The whole app is designed to run with no database at all (it falls back to
// seed data). So we never import @prisma/client at module load — we import it
// dynamically, and only when DATABASE_URL is present. That keeps the default
// `npm run dev` path free of any Prisma setup while still giving the DB layer
// a proper singleton when it's configured.

import type { PrismaClient } from "@prisma/client";

export const hasDatabase = (): boolean => Boolean(process.env.DATABASE_URL);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export async function getPrisma(): Promise<PrismaClient | null> {
  if (!hasDatabase()) return null;
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const { PrismaClient } = await import("@prisma/client");
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}
