---
name: project-contract-guard
description: Enforces monorepo ownership boundaries, shared Zod API/DB contracts, hybrid RAG retrieval conventions, and mandatory typechecking before any code edits in enterprise-doc-rag.
---

# Project Contract Guard

Follow this checklist before making any edits in the `enterprise-doc-rag` repository:

## 1. Read Ground Truth First
- Read `AGENTS.md` at the repository root.
- Read `shared/src/contracts.ts` and `backend/src/db/init.sql` to verify exact API shapes and database columns.

## 2. Enforce Strict Folder Ownership
Never modify files outside the active owner's scope:
- **LOCKED (do not edit without explicit user approval)**: `/shared/` and `/backend/src/db/init.sql`.
- **Rishikant**: `/backend/src/rag/` and `/scripts/`.
- **Rajat**: `/backend/src/api/` and `/backend/src/db/` (except `init.sql`).
- **Prince**: `/frontend/`.

## 3. Contract & Schema Discipline
- Always import Zod schemas and TypeScript types from `@rag/shared`.
- Validate Express inputs and outputs with the shared Zod schemas.
- Never invent, rename, or add unapproved API fields or database column names.

## 4. RAG & Embedding Specifications
- Use `@google/genai` (never `@google/generative-ai`).
- Use `Xenova/bge-small-en-v1.5` (384 dimensions) with `{ pooling: "cls", normalize: true }`.
- Prepend `"Represent this sentence for searching relevant passages: "` **ONLY** to search queries (never to ingested document chunks).
- For hybrid retrieval, use disjunctive (`OR`) `to_tsquery` on `fts_vector` combined with `<=>` cosine distance on `embedding` (`vector(384)`).
- Prompt the LLM with `[CHUNK_N]` markers and map returned `[CHUNK_N]` IDs deterministically back to the retrieved DB chunk records to construct `Citation` objects.

## 5. Mandatory Verification
- Run `npm run typecheck` from the repository root before finishing and confirm zero TypeScript errors across `shared`, `backend`, and `frontend`.
