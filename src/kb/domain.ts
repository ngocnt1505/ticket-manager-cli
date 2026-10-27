// Domain entities of the Knowledge Base (docs2/DECISIONS.md §2).

export interface Document {
  id: string; // "doc-001"
  title: string;
  content: string; // full markdown
  nodePath: string; // "/templates/email"
  tags: string[];
}

/** A document without its content, as returned by search and list. */
export type DocumentSummary = Omit<Document, 'content'>;

export type MatchType = 'title' | 'tag' | 'content';

export interface SearchResult {
  document: DocumentSummary;
  matchType: MatchType;
}

export interface KBQuery {
  query: string;
  filters?: { nodePath?: string };
  topK?: number;
}

export interface ListQuery {
  nodePath?: string;
  limit?: number;
}

export interface NewDocument {
  title: string;
  content: string;
  nodePath: string;
  tags?: string[];
}
