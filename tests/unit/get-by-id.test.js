const request = require('supertest');

const app = require('../../src/app');

const auth = (req) => req.auth('test-user1@fragments-testing.com', 'test-password1');

describe('GET /v1/fragments/:id', () => {
  test('authenticated users can create and retrieve a text fragment', async () => {
    const postRes = await auth(request(app).post('/v1/fragments'))
      .set('Content-Type', 'text/plain')
      .send('hello world');

    const getRes = await auth(request(app).get(`/v1/fragments/${postRes.body.fragment.id}`));
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toContain('text/plain');
    expect(getRes.text).toBe('hello world');
  });

  test('missing fragments return 404', async () => {
    const res = await auth(request(app).get('/v1/fragments/00000000-0000-0000-0000-000000000000'));
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('unsupported extensions return 415', async () => {
    const postRes = await auth(request(app).post('/v1/fragments'))
      .set('Content-Type', 'text/plain')
      .send('hello world');

    const res = await auth(
      request(app).get(`/v1/fragments/${postRes.body.fragment.id}.png`)
    );
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });

  test('GET /v1/fragments/:id/info returns fragment metadata', async () => {
    const postRes = await auth(request(app).post('/v1/fragments'))
      .set('Content-Type', 'text/plain')
      .send('hello world');

    const res = await auth(request(app).get(`/v1/fragments/${postRes.body.fragment.id}/info`));
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toBe(postRes.body.fragment.id);
    expect(res.body.fragment.type).toBe('text/plain');
  });

  test('GET /v1/fragments/:id/info returns 404 for missing fragment', async () => {
    const res = await auth(
      request(app).get('/v1/fragments/00000000-0000-0000-0000-000000000000/info')
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('markdown fragments can be converted to html using .html', async () => {
    const postRes = await auth(request(app).post('/v1/fragments'))
      .set('Content-Type', 'text/markdown')
      .send('# Hello');

    const res = await auth(request(app).get(`/v1/fragments/${postRes.body.fragment.id}.html`));

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('<h1>Hello</h1>');
  });

  test('expand=1 returns full fragment metadata', async () => {
    const postRes = await auth(request(app).post('/v1/fragments'))
      .set('Content-Type', 'text/plain')
      .send('hello world');

    const res = await auth(request(app).get('/v1/fragments?expand=1'));
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.fragments)).toBe(true);
    const fragment = res.body.fragments.find((item) => item.id === postRes.body.fragment.id);
    expect(fragment).toBeTruthy();
    expect(fragment.type).toBe('text/plain');
  });
});
