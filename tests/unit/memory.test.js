const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('../../src/model/data/memory');

describe('memory data adapter', () => {
  test('writeFragment() and readFragment() store and retrieve metadata', async () => {
    const ownerId = `owner-${Date.now()}-meta`;
    const id = 'fragment-a';
    const fragment = {
      id,
      ownerId,
      type: 'text/plain',
      size: 5,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    await writeFragment(fragment);
    const result = await readFragment(ownerId, id);

    expect(result).toEqual(fragment);
  });

  test('writeFragmentData() and readFragmentData() store and retrieve Buffer data', async () => {
    const ownerId = `owner-${Date.now()}-data`;
    const id = 'fragment-b';
    const data = Buffer.from('hello');

    await writeFragmentData(ownerId, id, data);
    const result = await readFragmentData(ownerId, id);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result).toEqual(data);
  });

  test('listFragments() returns ids by default and full metadata with expand=true', async () => {
    const ownerId = `owner-${Date.now()}-list`;
    const id = 'fragment-c';
    const fragment = {
      id,
      ownerId,
      type: 'text/plain',
      size: 1,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    await writeFragment(fragment);

    const ids = await listFragments(ownerId);
    const expanded = await listFragments(ownerId, true);

    expect(ids).toContain(id);
    expect(expanded).toEqual([fragment]);
  });

  test('deleteFragment() removes metadata and data', async () => {
    const ownerId = `owner-${Date.now()}-delete`;
    const id = 'fragment-d';
    const fragment = {
      id,
      ownerId,
      type: 'text/plain',
      size: 4,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    await writeFragment(fragment);
    await writeFragmentData(ownerId, id, Buffer.from('test'));

    await deleteFragment(ownerId, id);

    expect(await readFragment(ownerId, id)).toBe(undefined);
    expect(await readFragmentData(ownerId, id)).toBe(undefined);
  });
});
