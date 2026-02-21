import { defineCollection, z } from "astro:content";

const decks = defineCollection({
  type: "data",
  schema: z.any(),
});

const path = defineCollection({
  type: "data",
  schema: z.any(),
});

const library = defineCollection({
  type: "data",
  schema: z.any(),
});

export const collections = {
  decks,
  path,
  library,
};

