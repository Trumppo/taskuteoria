import { defineCollection, z } from "astro:content";

const flashcardSchema = z.array(
  z.object({
    id: z.string(),
    front: z.string(),
    back: z.string(),
  }),
);

const noteDeckSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  notes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      answer: z.string(),
      midi: z.number(),
      clef: z.enum(["treble", "bass"]),
      staffPos: z.number(),
      level: z.enum(["beginner", "intermediate", "expert"]).optional(),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      tags: z.array(z.string()).optional(),
      weight: z.number().optional(),
    }),
  ),
});

const rhythmDeckSchema = z.object({
  timeSignatures: z.array(
    z.object({
      id: z.enum(["4/4", "3/4", "6/8"]),
      label: z.string(),
      targetBeats: z.number().int().positive(),
    }),
  ),
  pieces: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      beats: z.number().positive(),
    }),
  ),
});

const keyDeckSchema = z.object({
  title: z.string(),
  questions: z.array(
    z.object({
      id: z.string(),
      prompt: z.string(),
      options: z.array(z.string()).min(1),
      correctIndex: z.number().int().nonnegative(),
    }),
  ),
});

const listeningDeckSchema = z.object({
  intervals: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      semitones: z.number().int(),
    }),
  ),
  chords: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      quality: z.enum(["major", "minor"]),
    }),
  ),
});

const decks = defineCollection({
  type: "data",
  schema: z.union([
    flashcardSchema,
    noteDeckSchema,
    rhythmDeckSchema,
    keyDeckSchema,
    listeningDeckSchema,
  ]),
});

const pathSchema = z.object({
  title: z.string(),
  intro: z.string(),
  days: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      summary: z.string(),
      steps: z.array(
        z.object({
          key: z.string(),
          label: z.string(),
          kind: z.enum(["nuotit", "rytmi", "savellajit", "kuuntele", "kortit", "pikavisa", "kirjasto"]),
        }),
      ),
    }),
  ),
});

const path = defineCollection({
  type: "data",
  schema: pathSchema,
});

const libraryCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
});

const miniLessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  questions: z.array(
    z.object({
      prompt: z.string(),
      options: z.array(z.string()).min(1),
      correctIndex: z.number().int().nonnegative(),
    }),
  ),
});

const library = defineCollection({
  type: "data",
  schema: z.union([z.array(libraryCardSchema), z.array(miniLessonSchema)]),
});

export const collections = {
  decks,
  path,
  library,
};
