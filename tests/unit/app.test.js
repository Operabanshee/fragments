const request = require('supertest');

const app = require('../../src/app');

describe('app 404 handler', () => {
  test('requests for unknown routes return a 404 error', async () => {
    const res = await request(app).get('/not-a-real-route');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      status: 'error',
      error: {
        message: 'not found',
        code: 404,
      },
    });
  });
});
