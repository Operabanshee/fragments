describe('auth/index module selection', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test('throws when both Cognito and Basic Auth are configured', () => {
    process.env.AWS_COGNITO_POOL_ID = 'pool-id';
    process.env.AWS_COGNITO_CLIENT_ID = 'client-id';
    process.env.HTPASSWD_FILE = 'tests/.htpasswd';

    expect(() => require('../../src/auth')).toThrow('Only one is allowed');
  });

  test('selects Cognito auth when Cognito env vars are set', () => {
    process.env.AWS_COGNITO_POOL_ID = 'pool-id';
    process.env.AWS_COGNITO_CLIENT_ID = 'client-id';
    delete process.env.HTPASSWD_FILE;

    jest.doMock('../../src/auth/cognito', () => ({
      strategy: jest.fn(),
      authenticate: jest.fn(),
    }));

    const auth = require('../../src/auth');
    expect(typeof auth.strategy).toBe('function');
    expect(typeof auth.authenticate).toBe('function');
  });

  test('throws when no auth configuration exists', () => {
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    delete process.env.HTPASSWD_FILE;

    expect(() => require('../../src/auth')).toThrow('no authorization configuration found');
  });
});
