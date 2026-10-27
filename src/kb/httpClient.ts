import type { KBClient } from './client';
import type { Document, DocumentSummary, KBQuery, ListQuery, MatchType, NewDocument, SearchResult } from './domain';
import { KBApiError, KBConnectionError, KBNotFoundError, KBValidationError } from './errors';

export interface HTTPKBClientOptions {
  /** Address of a KB server that follows docs2/DECISIONS.md §4, e.g. http://localhost:3000 */
  baseUrl: string;
  /** Called with one line per request and response when debugging (KB_DEBUG=1). */
  debug?: (line: string) => void;
}

type Json = Record<string, unknown>;

/** KBClient that calls a KB API server over HTTP (docs2/DECISIONS.md §4). */
export class HTTPKBClient implements KBClient {
  private readonly baseUrl: string;
  private readonly debug: (line: string) => void;

  constructor({ baseUrl, debug = () => {} }: HTTPKBClientOptions) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.debug = debug;
  }

  async search({ query, topK, filters }: KBQuery): Promise<SearchResult[]> {
    const { results } = await this.post('/search', { query, topK, filters });
    if (!Array.isArray(results) || !results.every(isSummary)) throw badResponse('/search');
    return results.map(({ id, title, nodePath, tags, matchType }) => ({
      document: { id, title, nodePath, tags },
      matchType: matchType as MatchType,
    }));
  }

  async list({ nodePath, limit }: ListQuery): Promise<DocumentSummary[]> {
    const { documents } = await this.post('/list', { nodePath, limit });
    if (!Array.isArray(documents) || !documents.every(isSummary)) throw badResponse('/list');
    return documents.map(({ id, title, nodePath, tags }) => ({ id, title, nodePath, tags }));
  }

  async retrieve(docId: string): Promise<Document> {
    return documentFrom(await this.post('/retrieve', { docId }), '/retrieve');
  }

  async add({ title, content, nodePath, tags }: NewDocument): Promise<Document> {
    return documentFrom(await this.post('/add', { title, content, nodePath, tags }), '/add');
  }

  /** Sends one request and turns every HTTP outcome into data or a KB error. */
  private async post(path: string, body: Json): Promise<Json> {
    const url = this.baseUrl + path;
    const requestText = JSON.stringify(body); // leaves out undefined fields
    this.debug(`[kb] → POST ${url} ${requestText}`);

    let response: Response;
    try {
      response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: requestText });
    } catch (err) {
      const reason = connectionReason(err);
      this.debug(`[kb] ✗ ${reason}`);
      throw new KBConnectionError(`cannot connect to KB server at ${this.baseUrl} (${reason})`);
    }

    const responseText = await response.text();
    this.debug(`[kb] ← ${response.status} ${responseText}`);
    const data = parseObject(responseText);

    if (response.ok) {
      if (!data) throw badResponse(path, response.status);
      return data;
    }
    const error = isObject(data?.error) ? data.error : {};
    const message = typeof error.message === 'string' ? error.message : `HTTP ${response.status}`;
    if (response.status === 400) throw new KBValidationError(message);
    if (response.status === 404) throw new KBNotFoundError(message);
    const code = typeof error.code === 'string' ? error.code : 'BAD_RESPONSE';
    throw new KBApiError(`KB server error ${response.status}: ${message}`, code, response.status);
  }
}

function documentFrom({ document }: Json, path: string): Document {
  if (!isSummary(document) || typeof document.content !== 'string') throw badResponse(path);
  const { id, title, content, nodePath, tags } = document;
  return { id, title, content, nodePath, tags };
}

function isSummary(value: unknown): value is DocumentSummary & Json {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.nodePath === 'string' &&
    Array.isArray(value.tags)
  );
}

function isObject(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseObject(text: string): Json | undefined {
  try {
    const value: unknown = JSON.parse(text);
    return isObject(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function badResponse(path: string, status = 200): KBApiError {
  return new KBApiError(`KB server sent an unexpected response for ${path}`, 'BAD_RESPONSE', status);
}

/** fetch only says "fetch failed"; the useful part (ECONNREFUSED, ENOTFOUND…) is in `cause`. */
function connectionReason(err: unknown): string {
  const cause = (err as { cause?: { code?: string; message?: string } })?.cause;
  return cause?.code ?? cause?.message ?? (err instanceof Error ? err.message : String(err));
}
