import type { KBClient } from './client';
import type { Document, DocumentSummary, KBQuery, ListQuery, MatchType, NewDocument, SearchResult } from './domain';
import { KBNotFoundError, KBValidationError } from './errors';

const DEFAULT_TOP_K = 10;
const DEFAULT_LIMIT = 10;
const MATCH_ORDER: MatchType[] = ['title', 'tag', 'content'];

/** Sample documents (docs2/DECISIONS.md §2): one email template, one team doc, one guide. */
export const SEED_DOCUMENTS: readonly Document[] = [
  {
    id: 'doc-001',
    title: 'Customer Response Template',
    content:
      '# Customer Response Template\n\nHi {{name}},\n\nThank you for contacting us. ' +
      'Our support team will get back to you within 24 hours.\n\nBest regards',
    nodePath: '/templates/email',
    tags: ['template', 'email'],
  },
  {
    id: 'doc-002',
    title: 'DevOps Team Members',
    content: '# DevOps Team Members\n\n- Alice – lead\n- Bob – on-call this week\n\nAsk in #devops for help.',
    nodePath: '/team/devops',
    tags: ['team', 'devops'],
  },
  {
    id: 'doc-003',
    title: 'Getting Started Guide',
    content: '# Getting Started Guide\n\nRead the docs in /docs, then email your team lead to get access.',
    nodePath: '/docs/guides',
    tags: ['guide', 'onboarding'],
  },
];

/** KBClient kept in memory: same rules as the KB API (docs2/DECISIONS.md §3), no network. */
export class MockKBClient implements KBClient {
  private readonly documents: Document[];

  constructor(documents: readonly Document[] = SEED_DOCUMENTS) {
    this.documents = documents.map(copy);
  }

  async search({ query, filters, topK = DEFAULT_TOP_K }: KBQuery): Promise<SearchResult[]> {
    const needle = (query ?? '').trim().toLowerCase();
    if (needle === '') throw new KBValidationError('query must not be empty');
    checkPositiveInteger('topK', topK);
    if (filters?.nodePath !== undefined) checkNodePath(filters.nodePath);

    return this.documents
      .filter((doc) => filters?.nodePath === undefined || isInside(doc.nodePath, filters.nodePath))
      .map((doc) => ({ doc, matchType: matchTypeOf(doc, needle) }))
      .filter((hit): hit is { doc: Document; matchType: MatchType } => hit.matchType !== undefined)
      .sort((a, b) => MATCH_ORDER.indexOf(a.matchType) - MATCH_ORDER.indexOf(b.matchType) || byId(a.doc, b.doc))
      .slice(0, topK)
      .map(({ doc, matchType }) => ({ document: summary(doc), matchType }));
  }

  async list({ nodePath, limit = DEFAULT_LIMIT }: ListQuery): Promise<DocumentSummary[]> {
    if (nodePath !== undefined) checkNodePath(nodePath);
    checkPositiveInteger('limit', limit);

    return this.documents
      .filter((doc) => nodePath === undefined || isInside(doc.nodePath, nodePath))
      .sort(byId)
      .slice(0, limit)
      .map(summary);
  }

  async retrieve(docId: string): Promise<Document> {
    const doc = this.documents.find((d) => d.id === docId);
    if (!doc) throw new KBNotFoundError(`document ${docId} not found`);
    return copy(doc);
  }

  async add({ title, content, nodePath, tags = [] }: NewDocument): Promise<Document> {
    if (!title?.trim()) throw new KBValidationError('title is required');
    if (!content?.trim()) throw new KBValidationError('content is required');
    checkNodePath(nodePath);

    const doc: Document = { id: this.nextId(), title: title.trim(), content, nodePath, tags: normalizeTags(tags) };
    this.documents.push(doc);
    return copy(doc);
  }

  private nextId(): string {
    const max = Math.max(0, ...this.documents.map((d) => Number(d.id.replace('doc-', '')) || 0));
    return `doc-${String(max + 1).padStart(3, '0')}`;
  }
}

function matchTypeOf(doc: Document, needle: string): MatchType | undefined {
  if (doc.title.toLowerCase().includes(needle)) return 'title';
  if (doc.tags.some((tag) => tag.toLowerCase().includes(needle))) return 'tag';
  if (doc.content.toLowerCase().includes(needle)) return 'content';
  return undefined;
}

/** "/templates/email" is inside "/templates", but not inside "/temp". */
function isInside(docPath: string, nodePath: string): boolean {
  const node = nodePath.length > 1 ? nodePath.replace(/\/+$/, '') : nodePath;
  return node === '/' || docPath === node || docPath.startsWith(`${node}/`);
}

function checkNodePath(nodePath: string): void {
  if (typeof nodePath !== 'string' || !nodePath.startsWith('/')) {
    throw new KBValidationError(`node path must start with "/": ${nodePath}`);
  }
}

function checkPositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new KBValidationError(`${name} must be a positive whole number: ${value}`);
  }
}

/** Same as week 2: trim, lower case, drop empty and duplicate tags. */
function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter((tag) => tag !== ''))];
}

function byId(a: { id: string }, b: { id: string }): number {
  return a.id.localeCompare(b.id);
}

function summary({ id, title, nodePath, tags }: Document): DocumentSummary {
  return { id, title, nodePath, tags: [...tags] };
}

function copy(doc: Document): Document {
  return { ...doc, tags: [...doc.tags] };
}
