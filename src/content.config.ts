import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const puzzles = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/puzzles' }),
  schema: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v, 'Invalid calendar date'),
    approved: z.literal(true),
    revision: z.number().int().positive(),
    image: z.string().regex(/^\/images\/[\w-]+\.png$/),
    alt: z.string().min(1),
    answers: z.array(z.string().trim().min(1)).min(1),
    display_answer: z.string().min(1),
    hints: z.array(z.string().min(1)).min(1),
    explanation: z.string().min(1),
  }),
});
export const collections = { puzzles };
