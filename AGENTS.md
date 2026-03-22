# AGENTS.md - Ivan Gegov Portfolio Working Guide

This repository is the personal portfolio and CV site for Ivan Gegov. Treat it as a real public-facing product where credibility, clarity, performance, and polish matter.

## Goal

- present Ivan Gegov as a senior animator / animation lead with strong VFX and production experience
- showcase work, case studies, reels, and CV material clearly
- make the site useful both as a portfolio and as a business-facing credibility surface

## Current Idea And Progress

- Product idea:
  portfolio, CV, and case-study site
- Current state:
  active Vite + React + TypeScript site with tests, docs, and deployment-oriented structure
- Progress level:
  live-product stage, not a raw scaffold
- Current opportunity:
  strengthen content depth, project storytelling, and optional lead-capture / CMS support

## Initial Setup Requirements

- Node.js 20+
- install dependencies:
  `npm install`
- run locally:
  `npm run dev`
- quality checks:
  `npm run lint`
  `npm run typecheck`
  `npm run test`
  `npm run build`

## Environments

- local development:
  Vite dev server
- preview:
  `npm run preview`
- production:
  static site deployment
- optional service environment:
  Supabase or other hosted services if forms, CMS, or analytics become active

## Dependencies

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- optional Supabase-related infrastructure indicated by the repo structure

## Backend Need

- backend required now:
  no mandatory custom backend
- backend recommended later:
  optional
- likely future backend:
  Supabase or another lightweight backend for contact forms, content management, protected admin updates, analytics, or asset metadata

## How Development Should Progress

1. Keep the public portfolio experience excellent first.
2. Prioritize truthful work presentation over decorative complexity.
3. Improve case studies, reel navigation, and project detail pages.
4. Add backend features only when they support real business needs such as contact capture or content updates.
5. Keep accessibility, load performance, and mobile presentation high.

## Product Roadmap

- Short term:
  sharpen homepage narrative, project cards, resume / CV clarity, and contact flow
- Medium term:
  add richer case studies, motion samples, testimonials, and press / credits structure
- Long term:
  optional CMS-backed content editing, protected admin updates, analytics, and downloadable tailored resume variants

## Repository Guardrails

- keep Node 20 usage repo-scoped
- do not require global Node version mutation
- keep pre-commit lightweight and fast
- keep pre-push as the stricter build / test gate if hooks are used
- do not introduce backend complexity unless the user-facing benefit is clear

## End Goal

The end goal is a high-confidence professional portfolio site that communicates skill, taste, and production leadership clearly enough to win attention, trust, and work.
