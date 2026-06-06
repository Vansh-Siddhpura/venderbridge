import { z } from 'zod';

export const CreateApprovalSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'REQUEST_REVISION']),
  comments: z.string().max(2000).optional(),
});

export type CreateApprovalInput = z.infer<typeof CreateApprovalSchema>;
