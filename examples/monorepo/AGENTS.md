# Monorepo Agent Guide

## Overview

This is a pnpm monorepo with multiple packages and apps.

## Commands

- Install: `pnpm install`
- Build: `pnpm build`
- Test: `pnpm test`
- Lint: `pnpm lint`

## Architecture

- `packages/` — shared libraries
- `apps/` — deployable applications

## Standards

- Use TypeScript everywhere.
- Follow Biome for linting and formatting.
- Use React Server Components where applicable.

## Testing

- Write tests for all packages.
- Run tests before every commit.
