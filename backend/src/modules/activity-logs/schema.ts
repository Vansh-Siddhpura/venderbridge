import { z } from 'zod';

export const ListActivityLogsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  userId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  action: z.string().optional(),
});

export type ListActivityLogsQuery = z.infer<typeof ListActivityLogsQuerySchema>;
