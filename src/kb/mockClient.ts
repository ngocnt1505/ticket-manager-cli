import type { KBClient } from './client';
import type { Document, DocumentSummary, KBQuery, ListQuery, NewDocument, SearchResult } from './domain';

// Stub: no behaviour yet (Red step).
export class MockKBClient implements KBClient {
  async search(_query: KBQuery): Promise<SearchResult[]> {
    return undefined as unknown as SearchResult[];
  }

  async list(_query: ListQuery): Promise<DocumentSummary[]> {
    return undefined as unknown as DocumentSummary[];
  }

  async retrieve(_docId: string): Promise<Document> {
    return undefined as unknown as Document;
  }

  async add(_input: NewDocument): Promise<Document> {
    return undefined as unknown as Document;
  }
}
