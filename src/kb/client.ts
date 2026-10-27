import type { Document, DocumentSummary, KBQuery, ListQuery, NewDocument, SearchResult } from './domain';

/**
 * What the CLI needs from a Knowledge Base. MockKBClient (in memory) and
 * HTTPKBClient (KB API over HTTP) both implement it and pass the same contract tests.
 */
export interface KBClient {
  search(query: KBQuery): Promise<SearchResult[]>;
  list(query: ListQuery): Promise<DocumentSummary[]>;
  retrieve(docId: string): Promise<Document>;
  add(input: NewDocument): Promise<Document>;
}
