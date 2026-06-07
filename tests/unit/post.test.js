const request = require('supertest');

const app = require('../../src/app');

const auth = (req) => req.auth('test-user1@fragments-testing.com', 'test-password1');

describe('POST /v1/fragments', () => {
  test('authenticated users can create a text fragment', async () => {
    const res = await auth(request(app).post('/v1/fragments'))
      .set('Content-Type', 'text/plain')
      .send('hello world');

    expect(res.statusCode).toBe(201);
    expect(res.headers.location).toMatch(/^http:\/\/.+\/v1\/fragments\/[0-9a-f-]+$/i);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.size).toBe(11);
    expect(res.body.fragment.id).toMatch(
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
    );
  });

  test('unsupported content types are rejected', async () => {
    const res = await auth(request(app).post('/v1/fragments'))
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ hello: 'world' }));

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });
});
