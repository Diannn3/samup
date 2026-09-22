import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const evidenceSchema = z.object({
  status: z.enum([
    'verified-current',
    'verified-foundational',
    'historical',
    'official-but-stale',
    'needs-approval',
    'unknown',
    'blocked',
  ]),
  visibility: z.enum([
    'public',
    'public-summary-only',
    'historical',
    'internal',
    'needs-approval',
    'private',
  ]),
  sourceLabel: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  sourceDocument: z.string().optional(),
  sourceDate: z.string().optional(),
  reviewedAt: z.string().min(1),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
});

const programs = defineCollection({
  loader: glob({ pattern: 'programs/**/*.{md,mdx}', base: './src/content' }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    organizer: z.string().min(1),
    samUpRole: z.string().min(1),
    lifecycle: z.enum(['current', 'scheduled', 'historical', 'cancelled', 'needs-verification']),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    recurringLabel: z.string().optional(),
    location: z.string().optional(),
    audience: z.string().optional(),
    summary: z.string().min(1),
    evidence: evidenceSchema,
  }),
});

const resources = defineCollection({
  loader: glob({ pattern: 'resources/**/*.{md,mdx}', base: './src/content' }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    type: z.enum(['reviewer', 'tutorial', 'guide', 'reference', 'external-link']),
    summary: z.string().min(1),
    courses: z.array(z.string()).optional(),
    externalUrl: z.string().url().optional(),
    publishedAt: z.string().optional(),
    updatedAt: z.string().optional(),
    evidence: evidenceSchema,
  }),
});

const chronicle = defineCollection({
  loader: glob({ pattern: 'chronicle/**/*.{md,mdx}', base: './src/content' }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    author: z.string().min(1),
    publishedAt: z.string().min(1),
    updatedAt: z.string().optional(),
    summary: z.string().min(1),
    sourceUrl: z.string().url().optional(),
    evidence: evidenceSchema,
  }),
});

const governance = defineCollection({
  loader: glob({ pattern: 'governance/**/*.{md,mdx}', base: './src/content' }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    documentType: z.enum(['constitution', 'bylaws', 'policy', 'public-guidance']),
    versionLabel: z.string().min(1),
    effectiveDate: z.string().optional(),
    summary: z.string().min(1),
    evidence: evidenceSchema,
  }),
});

const appliedMath = defineCollection({
  loader: glob({ pattern: 'applied-math/**/*.{md,mdx}', base: './src/content' }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    concept: z.string().min(1),
    level: z.enum(['introductory', 'intermediate', 'advanced']),
    summary: z.string().min(1),
    accessibilityDescription: z.string().min(1),
    publishedAt: z.string().min(1),
    updatedAt: z.string().optional(),
    sources: z.array(
      z.object({
        label: z.string().min(1),
        url: z.string().url().optional(),
      }),
    ).min(1),
    evidence: evidenceSchema,
  }),
});

export const collections = {
  programs,
  resources,
  chronicle,
  governance,
  appliedMath,
};
