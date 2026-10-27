import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import type { KBClient } from './client';
import { KBNotFoundError, KBValidationError } from './errors';
import { MockKBClient } from './mockClient';

type Body = Record<string, unknown>;
type Reply = { status: number; json: unknown };

/**
 * Reference KB server: the API contract of docs2/DECISIONS.md §4 over HTTP.
 * It only does the HTTP part; the rules come from `client` (by default the in-memory mock),
 * so the server and the mock cannot drift apart.
 */
export function createKBServer(client: KBClient = new MockKBClient()): Server {
  const routes: Record<string, (body: Body) => Promise<Reply>> = {
    '/search': async (body) => {
      const results = await client.search({
        query: requiredString(body, 'query'),
        topK: optionalNumber(body, 'topK'),
        filters: optionalFilters(body),
      });
      return ok({ results: results.map(({ document, matchType }) => ({ ...document, matchType })) });
    },
    '/list': async (body) =>
      ok({ documents: await client.list({ nodePath: optionalString(body, 'nodePath'), limit: optionalNumber(body, 'limit') }) }),
    '/retrieve': async (body) => ok({ document: await client.retrieve(requiredString(body, 'docId')) }),
    '/add': async (body) => {
      const document = await client.add({
        title: requiredString(body, 'title'),
        content: requiredString(body, 'content'),
        nodePath: requiredString(body, 'nodePath'),
        tags: optionalStringArray(body, 'tags'),
      });
      return { status: 201, json: { document } };
    },
  };

  return createServer(async (request, response) => {
    send(response, await handle(request, routes));
  });
}

async function handle(request: IncomingMessage, routes: Record<string, (body: Body) => Promise<Reply>>): Promise<Reply> {
  try {
    const path = new URL(request.url ?? '/', 'http://localhost').pathname;
    // Own keys only: routes.toString exists on every object but is not an endpoint.
    const route = request.method === 'POST' && Object.hasOwn(routes, path) ? routes[path] : undefined;
    if (!route) throw new KBNotFoundError(`unknown endpoint ${request.method} ${path}`);
    return await route(await readJsonObject(request));
  } catch (err) {
    if (err instanceof KBValidationError) return fail(400, 'INVALID_INPUT', err.message);
    if (err instanceof KBNotFoundError) return fail(404, 'NOT_FOUND', err.message);
    // Never show internal details (paths, stack traces) to the caller.
    return fail(500, 'INTERNAL', 'internal server error');
  }
}

async function readJsonObject(request: IncomingMessage): Promise<Body> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString('utf8');
  if (text.trim() === '') return {};
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new KBValidationError('request body must be a JSON object');
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new KBValidationError('request body must be a JSON object');
  }
  return body as Body;
}

function requiredString(body: Body, field: string): string {
  if (typeof body[field] !== 'string') throw new KBValidationError(`"${field}" must be a string`);
  return body[field] as string;
}

function optionalString(body: Body, field: string): string | undefined {
  return body[field] === undefined ? undefined : requiredString(body, field);
}

function optionalNumber(body: Body, field: string): number | undefined {
  if (body[field] === undefined) return undefined;
  if (typeof body[field] !== 'number') throw new KBValidationError(`"${field}" must be a number`);
  return body[field] as number;
}

function optionalStringArray(body: Body, field: string): string[] | undefined {
  const value = body[field];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new KBValidationError(`"${field}" must be an array of strings`);
  }
  return value;
}

function optionalFilters(body: Body): { nodePath?: string } | undefined {
  const { filters } = body;
  if (filters === undefined) return undefined;
  if (typeof filters !== 'object' || filters === null || Array.isArray(filters)) {
    throw new KBValidationError('"filters" must be an object');
  }
  return { nodePath: optionalString(filters as Body, 'nodePath') };
}

function ok(json: unknown): Reply {
  return { status: 200, json };
}

function fail(status: number, code: string, message: string): Reply {
  return { status, json: { error: { code, message } } };
}

function send(response: ServerResponse, { status, json }: Reply): void {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(json));
}
