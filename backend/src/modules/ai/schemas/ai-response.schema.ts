import { z } from 'zod';

export const aiProblemResponseSchema = z.object({
  is_problem: z.literal(true),
  category: z.string().min(1),
  priority: z.string().min(1),
  summary: z.string().min(1),
  user_message: z.string().min(1),
});

export const aiNoProblemResponseSchema = z.object({
  is_problem: z.literal(false),
});

export const aiResponseSchema = z.discriminatedUnion('is_problem', [
  aiProblemResponseSchema,
  aiNoProblemResponseSchema,
]);

export type AiProblemResponse = z.infer<typeof aiProblemResponseSchema>;
export type AiNoProblemResponse = z.infer<typeof aiNoProblemResponseSchema>;
export type AiResponse = z.infer<typeof aiResponseSchema>;
