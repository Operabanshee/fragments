describe('logger', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test('uses debug level when FRAGMENTS_LOG_LEVEL=debug', () => {
    process.env.FRAGMENTS_LOG_LEVEL = 'debug';

    const logger = require('../../src/logger');
    expect(logger.level).toBe('debug');
  });

  test('defaults to info level when no log level is provided', () => {
    delete process.env.FRAGMENTS_LOG_LEVEL;

    const logger = require('../../src/logger');
    expect(logger.level).toBe('info');
  });
});
