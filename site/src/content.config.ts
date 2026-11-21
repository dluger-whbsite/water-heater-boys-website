import {defineCollection, z} from 'astro:content';
import {glob} from 'astro/loaders';

const blog = defineCollection({
  loader: glob({pattern: '**/*.md', base: './src/content/blog'}),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    number: z.number(),
    publishedDate: z.string().date().optional(),
  }),
});

export const collections = {blog};
