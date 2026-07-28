const request = require('supertest');

const app = require('../../src/app');

const auth = (req) => req.auth('test-user1@fragments-testing.com', 'test-password1');

describe('DELETE /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', async () => {
    const res = await request(app).delete('/v1/fragments/00000000-0000-0000-0000-000000000000');

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('error');
  });

  test('authenticated users can delete their fragment', async () => {
    const postRes = await auth(request(app).post('/v1/fragments'))
      .set('Content-Type', 'text/plain')
      .send('hello world');

    const id = postRes.body.fragment.id;

    const delRes = await auth(request(app).delete(`/v1/fragments/${id}`));
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.status).toBe('ok');

    const getRes = await auth(request(app).get(`/v1/fragments/${id}`));
    expect(getRes.statusCode).toBe(404);
  });

  test('deleting a missing fragment returns 404', async () => {
    const res = await auth(
      request(app).delete('/v1/fragments/00000000-0000-0000-0000-000000000000')
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
  });
});
