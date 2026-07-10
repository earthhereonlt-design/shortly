import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * True when a thrown error means the database is unreachable / unconfigured
 * (missing DATABASE_URL, connection refused, timeout). Used to return a clean
 * maintenance response instead of leaking a stack trace to the browser.
 */
export function isDatabaseUnavailable(error: unknown): boolean {
  if (!error) return false;
  const e = error as { constructor?: { name?: string }; message?: string };
  const name = e?.constructor?.name ?? "";
  if (name === "PrismaClientInitializationError") return true;
  const msg = e?.message ?? "";
  return /DATABASE_URL|can't reach database|connection|ECONNREFUSED|timeout/i.test(
    msg,
  );
}
