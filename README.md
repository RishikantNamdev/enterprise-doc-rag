# Enterprise Document Intelligence & Retrieval-Augmented Generation (RAG) System

**Course:** CS 706: Major Project – I  
**Institution:** Department of Computer Science & Engineering, Indore Institute of Science & Technology (IIST)  
**Batch:** 2023–2027  
**Faculty Advisor:** Prof. Mahendra Chouhan

An enterprise-grade document intelligence platform for natural-language question answering over uploaded organizational PDFs. It combines local dense semantic embeddings with PostgreSQL full-text search via Reciprocal Rank Fusion (RRF), then generates structured answers with page-level source citations and explicit hallucination abstention when evidence is insufficient.

> **Current Status:** The monorepo foundation, Dockerized PostgreSQL 16 + `pgvector` schema, shared Zod API contracts (`@rag/shared`), and `GET /api/health` endpoint are live and verified. Core RAG ingestion/retrieval, document/chat REST endpoints, and frontend UI workflows are in active development.

---

## Architecture Overview

```text
INGESTION PIPELINE
──────────────────
  PDF Upload (Express + Multer)
       │
       ▼
  Page-by-Page Text Extraction (pdfjs-dist)
       │
       ▼
  Metadata-Aware Recursive Chunking (documentId, pageNumber, chunkIndex)
       │
       ▼
  Local Dense Embeddings (@huggingface/transformers: Xenova/bge-small-en-v1.5, 384-d)
       │
       ▼
  PostgreSQL 16 (documents + document_chunks)
    ├── pgvector vector(384) + HNSW (vector_cosine_ops)
    └── tsvector ('english') + GIN index

QUERY & CITATION PIPELINE
─────────────────────────
  User Question (React UI ──▶ POST /api/chat)
       │
       ├──────────────────────────────────────────────┐
       ▼                                              ▼
  BGE Query Embedding (384-d,                   Disjunctive ('OR') to_tsquery
  with query prefix)                            over fts_vector (GIN)
       │                                              │
       └──────────────────────┬───────────────────────┘
                              ▼
               Hybrid Retrieval + Reciprocal Rank Fusion (RRF)
                              │
                              ▼
               @google/genai (gemini-4-hydrogen, structured JSON)
                              │
                              ▼
               Deterministic [CHUNK_N] ──▶ DB Citation Mapping
               (or abstained: true when evidence is missing)
                              │
                              ▼
               Cited Answer + Page Excerpts (React UI)
```

---

## Tech Stack

- **Frontend:** React (`^19.3.1`), TypeScript (`^5.7.3`), Vite (`^8.3.8`), Tailwind CSS v4 (`@tailwindcss/vite` `^4.3.5`, `tailwindcss` `^4.3.5`), Zod (`^3.24.2`), `@rag/shared`
- **Backend:** Node.js, Express (`^5.3.0`), TypeScript (`tsx` `^4.23.15`), `pg` (`^8.23.1`), `multer` (`^2.5.0`), `cors` (`^2.8.6`), `dotenv` (`^18.0.10`), Zod (`^3.24.2`), `@rag/shared`
- **Database:** PostgreSQL 16 (`pgvector/pgvector:pg16` via Docker Compose), `pgvector` (`vector(384)` + HNSW `vector_cosine_ops`), `pgcrypto`, native PostgreSQL `tsvector` (`english`) + GIN index
- **Document Processing & Embeddings:** `pdfjs-dist` (`^6.5.438`), `@huggingface/transformers` (`^4.3.2`) running `Xenova/bge-small-en-v1.5` locally (384 dimensions, `{ pooling: "cls", normalize: true }`)
- **Answer Generation:** `@google/genai` (`^3.6.1`) using `gemini-4-hydrogen`
- **Tooling & Validation:** npm workspaces (`shared`, `backend`, `frontend`), TypeScript `strict: true`, Zod (`^3.24.2`) end-to-end request/response contracts

---

## Repository Structure & Folder Ownership

```text
enterprise-doc-rag/
├── .agents/
│   └── skills/
│       ├── gemini-api-dev/
│       ├── postgres/
│       ├── project-contract-guard/
│       └── systematic-debugging/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── server.ts        # Express app, CORS, GET /api/health
│   │   ├── db/
│   │   │   ├── init.sql         # LOCKED PostgreSQL + pgvector DDL
│   │   │   └── pool.ts          # pg.Pool configured from DATABASE_URL
│   │   ├── rag/
│   │   │   └── index.ts         # ingestPdfDocument & queryDocuments stubs
│   │   ├── env.ts               # Root .env loader via import.meta.url
│   │   └── index.ts             # Server entrypoint (port 4000)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Placeholder shell importing @rag/shared
│   │   ├── index.css            # Tailwind CSS v4 entry
│   │   └── main.tsx             # React root mount
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts           # Port 5173 + /api proxy -> :4000
├── scripts/
│   └── sample-pdfs/             # Sample PDF corpus directory
├── shared/
│   ├── src/
│   │   ├── contracts.ts         # LOCKED Zod schemas & TS types
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── .env.example
├── AGENTS.md
├── docker-compose.yml
└── package.json
```

### Folder Ownership Matrix

| Scope / Owner | Roll No. | Git Branch | Owned Paths | Rules |
|---|---|---|---|---|
| **LOCKED** | — | `main` | `shared/`, `backend/src/db/init.sql` | Edit **only** by explicit team consensus |
| **Rishikant Namdev** | `0818CS231155` | `rag/pipeline` | `backend/src/rag/`, `scripts/` | Exclusive write ownership |
| **Rajat Chhaparwal** | `0818CS231149` | `backend/api` | `backend/src/api/`, `backend/src/db/` (excluding `init.sql`) | Exclusive write ownership |
| **Prince Jatav** | `0818CS231141` | `frontend/ui` | `frontend/` | Exclusive write ownership |

---

## Prerequisites & Local Setup

### Prerequisites
- **Node.js** `v20+` (with `npm`)
- **Git**
- **Docker Desktop** (required for running PostgreSQL 16 + `pgvector`; PostgreSQL does **not** need to be installed natively on Windows)

> **Windows PowerShell Note:** If `npm` is blocked by execution policy (`npm.ps1 cannot be loaded`), run once in PowerShell:  
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/RishikantNamdev/enterprise-doc-rag.git
   cd enterprise-doc-rag
   ```

2. **Create and configure `.env`**
   ```powershell
   Copy-Item .env.example .env
   ```
   Open `.env` and set `GEMINI_API_KEY` to your Google AI Studio API key. Default settings from `.env.example`:
   - `PORT=4000`
   - `DATABASE_URL=postgresql://raguser:ragpass@localhost:5432/ragdb`
   - `GEMINI_MODEL=gemini-4-hydrogen`
   - `EMBEDDING_MODEL=Xenova/bge-small-en-v1.5`
   - `CORS_ORIGIN=http://localhost:5173`

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start PostgreSQL + `pgvector` with Docker**
   ```bash
   npm run db:up
   ```

5. **Verify database tables and `pgvector` extension**
   ```bash
   docker exec rag_postgres psql -U raguser -d ragdb -c "\dt" -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"
   ```
   Confirm `documents` and `document_chunks` exist and the `vector` extension is active.

6. **Run backend and frontend dev servers** (in separate terminals)
   ```bash
   npm run dev:backend
   ```
   ```bash
   npm run dev:frontend
   ```

7. **Verify the health endpoint and UI**
   - Backend health check: `http://localhost:4000/api/health` → `{"status":"ok","db":"connected"}`
   - Frontend dev server: `http://localhost:5173` (proxies `/api` requests to `http://localhost:4000`)

---

## Team Workflow & Agentic Coding Rules

- **Branching Discipline:** Never commit or push directly to `main`. Develop exclusively on your assigned branch (`rag/pipeline`, `backend/api`, or `frontend/ui`) and merge via pull request.
- **Pre-Commit Verification:** Always run `npm run typecheck` from the repo root and confirm zero errors across `shared`, `backend`, and `frontend` before committing.
- **Project Guardrails:** Every teammate and AI coding agent must follow [AGENTS.md](AGENTS.md) and [.agents/skills/project-contract-guard/SKILL.md](.agents/skills/project-contract-guard/SKILL.md):
  - Import all API schemas and TypeScript types from `@rag/shared`.
  - Use `@google/genai` (never `@google/generative-ai`) with `gemini-4-hydrogen`.
  - Configure `Xenova/bge-small-en-v1.5` (384 dims) with `{ pooling: "cls", normalize: true }`, applying `"Represent this sentence for searching relevant passages: "` **only** to search queries.
  - Use disjunctive (`OR`) `to_tsquery` + `<=>` cosine distance and map LLM `[CHUNK_N]` references deterministically from database records.

### Role-Specific Agent Skills

Four project-level skills are already committed in `.agents/skills/` and available automatically after `git clone`:

- `project-contract-guard`
- `systematic-debugging`
- `gemini-api-dev`
- `postgres`

Teammates only need to install their additional role-specific skills globally (`-g`) on their local machines:

- **Rishikant (`rag/pipeline`)**: No extra installs required (all required skills are already committed in `.agents/skills/`).

- **Rajat (`backend/api`)**
  ```bash
  npx skills add supabase/agent-skills --skill supabase-postgres-best-practices -a antigravity -g
  ```

- **Prince (`frontend/ui`)**
  ```bash
  npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices -a antigravity -g
  npx skills add anthropics/skills --skill frontend-design -a antigravity -g
  ```

> **Note:** Always use `-g` for personal/role-specific skills. Do not modify or commit `skills-lock.json` or `.agents/skills/` on feature branches (`rag/pipeline`, `backend/api`, `frontend/ui`) to avoid merge conflicts.

---

## API Endpoints & Shared Contracts

All request inputs and response payloads are strictly typed and validated with Zod schemas exported from `@rag/shared` (`shared/src/contracts.ts`).

| Method & Path | Status | Contract / Purpose |
|---|---|---|
| `GET /api/health` | `[Implemented]` | Executes `SELECT 1` against PostgreSQL; returns `{"status":"ok","db":"connected"}` (`200`) or error (`500`). |
| `POST /api/documents` | `[Planned]` | Accepts PDF upload via `multer`, runs ingestion, and returns `UploadDocumentResponseSchema` (`{ document }`). |
| `GET /api/documents` | `[Planned]` | Lists uploaded documents and ingestion status via `ListDocumentsResponseSchema` (`{ documents }`). |
| `DELETE /api/documents/:id` | `[Planned]` | Deletes a document record and cascades chunk removal (`ON DELETE CASCADE`). |
| `POST /api/chat` | `[Planned]` | Validates `ChatRequestSchema` (`question`, optional `documentIds`, `topK` 1–15) and returns `ChatResponseSchema` (`answer`, `abstained`, `citations`, optional `latencyMs`). |

Error responses conform to `ApiErrorSchema` (`{ error, details? }`).

---

## Available Scripts

Defined in the root `package.json`:

| Script | Command | Description |
|---|---|---|
| `npm run db:up` | `docker compose up -d` | Starts the `rag_postgres` PostgreSQL 16 + `pgvector` container in the background. |
| `npm run db:down` | `docker compose down` | Stops and removes the running database container while preserving the `pgdata` volume. |
| `npm run db:reset` | `docker compose down -v && docker compose up -d` | Drops the `pgdata` volume and recreates the database cleanly from `backend/src/db/init.sql`. |
| `npm run dev:backend` | `npm --workspace=backend run dev` | Starts the Express backend (`tsx watch src/index.ts`) on `http://localhost:4000`. |
| `npm run dev:frontend` | `npm --workspace=frontend run dev` | Starts the Vite React dev server on `http://localhost:5173`. |
| `npm run typecheck` | `npm --workspace=shared run typecheck && npm --workspace=backend run typecheck && npm --workspace=frontend run typecheck` | Runs `tsc --noEmit` across `shared`, `backend`, and `frontend`. |
