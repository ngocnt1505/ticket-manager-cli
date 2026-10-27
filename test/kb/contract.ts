import type { KBClient } from '../../src/kb/client';

/**
 * Behaviour every KBClient must have (docs2/DECISIONS.md §3). Run once per client:
 * the mock now, the HTTP client later – same tests, so both behave the same.
 *
 * `makeClient` must return a client holding the three sample documents:
 *   doc-001 Customer Response Template  /templates/email  [template, email]
 *   doc-002 DevOps Team Members          /team/devops      [team, devops]
 *   doc-003 Getting Started Guide        /docs/guides      [guide, onboarding]
 */
export function describeKBClient(name: string, makeClient: () => Promise<KBClient>): void {
  const ids = (items: { id: string }[] | undefined) => items?.map((item) => item.id);
  const searchIds = (results: { document: { id: string } }[] | undefined) =>
    results?.map((result) => result.document.id);
  const invalid = { name: 'KBValidationError', code: 'INVALID_INPUT' };

  describe(`${name} – search`, () => {
    test('K1: finds a document by a word in its title, ignoring case', async () => {
      const client = await makeClient();
      for (const query of ['response', 'RESPONSE']) {
        const results = await client.search({ query });
        expect(results).toEqual([
          {
            document: {
              id: 'doc-001',
              title: 'Customer Response Template',
              nodePath: '/templates/email',
              tags: ['template', 'email'],
            },
            matchType: 'title',
          },
        ]);
      }
    });

    test('K2: reports where it matched – title before tag before content', async () => {
      const client = await makeClient();
      const results = await client.search({ query: 'email' });
      expect(results?.map((r) => [r.document.id, r.matchType])).toEqual([
        ['doc-001', 'tag'],
        ['doc-003', 'content'],
      ]);
    });

    test('K3: orders results by match type, then by id', async () => {
      const client = await makeClient();
      const results = await client.search({ query: 'team' });
      expect(results?.map((r) => [r.document.id, r.matchType])).toEqual([
        ['doc-002', 'title'],
        ['doc-001', 'content'],
        ['doc-003', 'content'],
      ]);
    });

    test('K4: returns at most topK results', async () => {
      const client = await makeClient();
      expect(searchIds(await client.search({ query: 'team', topK: 2 }))).toEqual(['doc-002', 'doc-001']);
    });

    test('K5: can be limited to one node', async () => {
      const client = await makeClient();
      const results = await client.search({ query: 'team', filters: { nodePath: '/team' } });
      expect(searchIds(results)).toEqual(['doc-002']);
    });

    test('K6: returns an empty list when nothing matches', async () => {
      const client = await makeClient();
      expect(await client.search({ query: 'no such words' })).toEqual([]);
    });

    test('K7: results never include the document content', async () => {
      const client = await makeClient();
      const [first] = (await client.search({ query: 'response' })) ?? [];
      expect(first?.document).not.toHaveProperty('content');
    });

    test('K8: an empty query or a topK that is not a positive whole number is invalid', async () => {
      const client = await makeClient();
      await expect(client.search({ query: '   ' })).rejects.toMatchObject(invalid);
      for (const topK of [0, -1, 1.5]) {
        await expect(client.search({ query: 'team', topK })).rejects.toMatchObject(invalid);
      }
    });
  });

  describe(`${name} – list`, () => {
    test('K9: without a node, lists every document sorted by id, without content', async () => {
      const client = await makeClient();
      const documents = await client.list({});
      expect(ids(documents)).toEqual(['doc-001', 'doc-002', 'doc-003']);
      expect(documents?.[0]).not.toHaveProperty('content');
    });

    test('K10: lists a node and everything inside it, but not a node that only shares a prefix', async () => {
      const client = await makeClient();
      expect(ids(await client.list({ nodePath: '/templates/email' }))).toEqual(['doc-001']);
      expect(ids(await client.list({ nodePath: '/templates' }))).toEqual(['doc-001']);
      expect(ids(await client.list({ nodePath: '/temp' }))).toEqual([]);
    });

    test('K11: returns at most limit documents', async () => {
      const client = await makeClient();
      expect(ids(await client.list({ limit: 2 }))).toEqual(['doc-001', 'doc-002']);
    });

    test('K12: a node path not starting with "/" or a bad limit is invalid', async () => {
      const client = await makeClient();
      await expect(client.list({ nodePath: 'templates' })).rejects.toMatchObject(invalid);
      await expect(client.list({ limit: 0 })).rejects.toMatchObject(invalid);
    });
  });

  describe(`${name} – retrieve`, () => {
    test('K13: returns the full document, with its content', async () => {
      const client = await makeClient();
      const document = await client.retrieve('doc-002');
      expect(document).toMatchObject({
        id: 'doc-002',
        title: 'DevOps Team Members',
        nodePath: '/team/devops',
        tags: ['team', 'devops'],
      });
      expect(document?.content).toContain('on-call');
    });

    test('K14: an unknown id fails with NOT_FOUND and names the id', async () => {
      const client = await makeClient();
      await expect(client.retrieve('doc-999')).rejects.toMatchObject({
        name: 'KBNotFoundError',
        code: 'NOT_FOUND',
        message: expect.stringContaining('doc-999'),
      });
    });
  });

  describe(`${name} – add`, () => {
    test('K15: adds a document with the next id and normalised tags; it can then be retrieved and listed', async () => {
      const client = await makeClient();
      const added = await client.add({
        title: 'SMS Reminder',
        content: '# SMS Reminder\n\nYour appointment is tomorrow.',
        nodePath: '/templates/sms',
        tags: [' SMS', 'Reminder ', 'sms', ''],
      });
      expect(added).toEqual({
        id: 'doc-004',
        title: 'SMS Reminder',
        content: '# SMS Reminder\n\nYour appointment is tomorrow.',
        nodePath: '/templates/sms',
        tags: ['sms', 'reminder'],
      });
      expect(await client.retrieve('doc-004')).toEqual(added);
      expect(ids(await client.list({ nodePath: '/templates' }))).toEqual(['doc-001', 'doc-004']);
    });

    test('K16: a missing title or content, or a bad node path, is invalid and adds nothing', async () => {
      const client = await makeClient();
      const good = { title: 'T', content: 'C', nodePath: '/templates/sms' };
      for (const bad of [
        { ...good, title: '  ' },
        { ...good, content: '' },
        { ...good, nodePath: 'templates/sms' },
      ]) {
        await expect(client.add(bad)).rejects.toMatchObject(invalid);
      }
      expect(ids(await client.list({}))).toEqual(['doc-001', 'doc-002', 'doc-003']);
    });
  });
}
