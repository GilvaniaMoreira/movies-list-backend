import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
