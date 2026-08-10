const request = require('supertest');

const app = require('../../src/app');

const auth = (req) => req.auth('test-user1@fragments-testing.com', 'test-password1');

describe('PUT /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', async () => {
    const res = await request(app)
      .put('/v1/fragments/00000000-0000-0000-0000-000000000000')
      .set('Content-Type', 'text/plain')
      .send('updated');

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('error');
  });

  test('authenticated users can update their fragment', async () => {
    const postRes = await auth(request(app).post('/v1/fragments'))
      .set('Content-Type', 'text/plain')
      .send('hello world');

    const id = postRes.body.fragment.id;

    const putRes = await auth(request(app).put(`/v1/fragments/${id}`))
      .set('Content-Type', 'text/plain')
      .send('updated text');

    expect(putRes.statusCode).toBe(200);
    expect(putRes.body.status).toBe('ok');
    expect(putRes.body.fragment.id).toBe(id);

    const getRes = await auth(request(app).get(`/v1/fragments/${id}`));
    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toBe('updated text');
  });

  test('updating a missing fragment returns 404', async () => {
    const res = await auth(request(app).put('/v1/fragments/00000000-0000-0000-0000-000000000000'))
      .set('Content-Type', 'text/plain')
      .send('updated');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('updating with a different content type returns 400', async () => {
    const postRes = await auth(request(app).post('/v1/fragments'))
      .set('Content-Type', 'text/plain')
      .send('hello world');

    const id = postRes.body.fragment.id;

    const putRes = await auth(request(app).put(`/v1/fragments/${id}`))
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ hello: 'world' }));

    expect(putRes.statusCode).toBe(400);
    expect(putRes.body.status).toBe('error');
  });

  test('unsupported content type is rejected', async () => {
    const postRes = await auth(request(app).post('/v1/fragments'))
      .set('Content-Type', 'text/plain')
      .send('hello world');

    const id = postRes.body.fragment.id;

    const putRes = await auth(request(app).put(`/v1/fragments/${id}`))
      .set('Content-Type', 'application/pdf')
      .send('not supported');

    expect(putRes.statusCode).toBe(415);
    expect(putRes.body.status).toBe('error');
  });
});
