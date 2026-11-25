import type { ChatRequest, ChatResponse } from "@rag/shared";

export async function ingestPdfDocument(input: {
  documentId: string;
  filename: string;
  buffer: Buffer;
}): Promise<{ pageCount: number; chunkCount: number }> {
  void input;
  throw new Error("ingestPdfDocument is not implemented yet");
}

export async function queryDocuments(input: ChatRequest): Promise<ChatResponse> {
  void input;
  throw new Error("queryDocuments is not implemented yet");
}
