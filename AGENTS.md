# Enterprise Document Intelligence & RAG System — Agent Guardrails

## Locked Tech Stack
- **Monorepo**: npm workspaces (`shared`, `backend`, `frontend`) with TypeScript (`strict: true`).
- **Database**: PostgreSQL 16 (`pgvector/pgvector:pg16`) with `pgvector` (`vector(384)` + HNSW `vector_cosine_ops`) and native PostgreSQL `tsvector` (`english`) + GIN index.
- **Embeddings**: `@huggingface/transformers` running `Xenova/bge-small-en-v1.5` locally (384 dimensions).
- **LLM**: `@google/genai` SDK using `gemini-4-hydrogen` (never `@google/generative-ai`).
- **Backend**: Node.js + Express + TypeScript (`tsx`), `pg`, `multer`, `pdfjs-dist`, `zod`, `cors`, `dotenv`.
- **Frontend**: Vite + React + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`), `zod`.

## Strict Folder Ownership
- **LOCKED (never edit without explicit user approval)**:
  - `/shared/`
  - `/backend/src/db/init.sql`
- **Rishikant** owns exclusively:
  - `/backend/src/rag/`
  - `/scripts/`
- **Rajat** owns exclusively:
  - `/backend/src/api/`
  - `/backend/src/db/` (excluding the locked `init.sql`)
- **Prince** owns exclusively:
  - `/frontend/`

Do not modify files outside your assigned ownership boundary.

## Mandatory Engineering Rules
1. **Shared Contracts**: Always import API request/response schemas and TypeScript types from `@rag/shared`. Never duplicate or invent contract types or field names.
2. **Zod Validation**: Validate all Express request inputs and API outputs using the Zod schemas from `@rag/shared`.
3. **Gemini SDK**: Always use `@google/genai` (never the legacy `@google/generative-ai` package).
4. **Embedding Configuration**:
   - Model: `Xenova/bge-small-en-v1.5` (384 dimensions).
   - Extraction options: `{ pooling: "cls", normalize: true }`.
   - Query prefix: Prepend `"Represent this sentence for searching relevant passages: "` **ONLY** to search queries — never to document chunks during ingestion.
5. **Hybrid Retrieval & Citations**:
   - Use disjunctive (`OR`) `to_tsquery` for full-text search alongside `<=>` cosine distance on `vector(384)`.
   - Map LLM citations deterministically from DB records via `[CHUNK_N]` IDs.
6. **Verification**: Always run `npm run typecheck` before finishing any task.
