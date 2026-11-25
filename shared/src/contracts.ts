import { z } from "zod";

export const DocumentStatusSchema = z.enum(["processing", "ready", "failed"]);
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  fileSizeBytes: z.number().int().nonnegative(),
  pageCount: z.number().int().nonnegative(),
  chunkCount: z.number().int().nonnegative(),
  status: DocumentStatusSchema,
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
});
export type DocumentRecord = z.infer<typeof DocumentSchema>;

export const UploadDocumentResponseSchema = z.object({
  document: DocumentSchema,
});
export type UploadDocumentResponse = z.infer<typeof UploadDocumentResponseSchema>;

export const ListDocumentsResponseSchema = z.object({
  documents: z.array(DocumentSchema),
});
export type ListDocumentsResponse = z.infer<typeof ListDocumentsResponseSchema>;

export const CitationSchema = z.object({
  citationIndex: z.number().int().positive(),
  chunkId: z.string().uuid(),
  documentId: z.string().uuid(),
  documentName: z.string(),
  pageNumber: z.number().int().positive(),
  excerpt: z.string(),
});
export type Citation = z.infer<typeof CitationSchema>;

export const ChatRequestSchema = z.object({
  question: z.string().trim().min(1).max(2000),
  documentIds: z.array(z.string().uuid()).optional(),
  topK: z.number().int().min(1).max(15).default(5),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatResponseSchema = z.object({
  answer: z.string(),
  abstained: z.boolean(),
  citations: z.array(CitationSchema),
  latencyMs: z.number().nonnegative().optional(),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

export const ApiErrorSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
