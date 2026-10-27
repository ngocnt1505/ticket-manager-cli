import type { KBClient } from './client';
import type { Document, DocumentSummary, KBQuery, ListQuery, NewDocument, SearchResult } from './domain';

export interface HTTPKBClientOptions {
  /** Address of a KB server that follows docs2/DECISIONS.md §4, e.g. http://localhost:3000 */
  baseUrl: string;
  /** Called with one line per request and response when debugging (KB_DEBUG=1). */
  debug?: (line: string) => void;
}

// Stub: no behaviour yet (Red step).
export class HTTPKBClient implements KBClient {
  constructor(_options: HTTPKBClientOptions) {}

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
