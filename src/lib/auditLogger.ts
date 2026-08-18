import { PrismaClient } from '@prisma/client';

export async function logCraftItemEvent({
  prisma,
  craftItemId,
  actorId = "SYSTEM",
  actorRole = "SYSTEM",
  action,
  previousState = null,
  newState = null,
  comments = null,
}: {
  prisma: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> | PrismaClient;
  craftItemId: string;
  actorId?: string;
  actorRole?: string;
  action: string;
  previousState?: any;
  newState?: any;
  comments?: string | null;
}) {
  return prisma.auditLog.create({
    data: {
      craftItemId,
      actorId,
      actorRole,
      action,
      previousState: previousState ? previousState : undefined,
      newState: newState ? newState : undefined,
      comments,
    },
  });
}
