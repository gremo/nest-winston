import { Logger } from 'winston';
import { WinstonLogger } from './winston.classes';

describe('WinstonLogger', () => {
  let winstonLogger: WinstonLogger;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    // Create a mock Winston Logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      log: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    // Create a WinstonLogger instance with the mock
    winstonLogger = new WinstonLogger(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setContext', () => {
    it('should set the context', () => {
      const context = 'TestContext';
      winstonLogger.setContext(context);

      // Test that setting context works by calling a method that uses it
      winstonLogger.log('test');
      expect(mockLogger.info).toHaveBeenCalledWith('test', { context });
    });
  });

  describe('log', () => {
    it('should log string message with context', () => {
      const message = 'test message';
      const context = 'TestContext';

      winstonLogger.log(message, context);

      expect(mockLogger.info).toHaveBeenCalledWith(message, { context });
    });

    it('should log string message with default context', () => {
      const message = 'test message';
      const context = 'DefaultContext';

      winstonLogger.setContext(context);
      winstonLogger.log(message);

      expect(mockLogger.info).toHaveBeenCalledWith(message, { context });
    });

    it('should log object message with level', () => {
      const message = {
        message: 'test message',
        level: 'warn',
        additionalData: 'test'
      };
      const context = 'TestContext';

      winstonLogger.log(message, context);

      expect(mockLogger.log).toHaveBeenCalledWith(
        'warn',
        'test message',
        { context, additionalData: 'test' }
      );
    });
  });

  describe('error', () => {
    it('should log string error message with context and trace', () => {
      const message = 'error message';
      const trace = 'error trace';
      const context = 'TestContext';

      winstonLogger.error(message, trace, context);

      expect(mockLogger.error).toHaveBeenCalledWith(
        message,
        { context, stack: [trace] }
      );
    });

    it('should log Error instance', () => {
      const errorInstance = new Error('test error');
      const context = 'TestContext';

      winstonLogger.error(errorInstance, undefined, context);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'test error',
        {
          context,
          stack: [errorInstance.stack],
          error: errorInstance
        }
      );
    });

    it('should log object with error property', () => {
      const errorObj = new Error('nested error');
      errorObj.stack = 'error stack line 1\nerror stack line 2';

      const message = {
        message: 'error message',
        error: errorObj,
        additionalData: 'test'
      };
      const context = 'TestContext';

      winstonLogger.error(message, undefined, context);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'error message',
        {
          context,
          stack: [errorObj.stack],
          error: 'nested error',
          name: 'Error',
          additionalData: 'test'
        }
      );
    });
  });

  describe('warn', () => {
    it('should log string warning message with context', () => {
      const message = 'warning message';
      const context = 'TestContext';

      winstonLogger.warn(message, context);

      expect(mockLogger.warn).toHaveBeenCalledWith(message, { context });
    });

    it('should log object warning message', () => {
      const message = {
        message: 'warning message',
        additionalData: 'test'
      };
      const context = 'TestContext';

      winstonLogger.warn(message, context);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'warning message',
        {
          context,
          additionalData: 'test'
        }
      );
    });
  });

  describe('debug', () => {
    it('should log string debug message with context', () => {
      const message = 'debug message';
      const context = 'TestContext';

      winstonLogger.debug!(message, context);

      expect(mockLogger.debug).toHaveBeenCalledWith(message, { context });
    });

    it('should log object debug message', () => {
      const message = {
        message: 'debug message',
        additionalData: 'test'
      };
      const context = 'TestContext';

      winstonLogger.debug!(message, context);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'debug message',
        {
          context,
          additionalData: 'test'
        }
      );
    });
  });

  describe('verbose', () => {
    it('should log string verbose message with context', () => {
      const message = 'verbose message';
      const context = 'TestContext';

      winstonLogger.verbose!(message, context);

      expect(mockLogger.verbose).toHaveBeenCalledWith(message, { context });
    });

    it('should log object verbose message', () => {
      const message = {
        message: 'verbose message',
        additionalData: 'test'
      };
      const context = 'TestContext';

      winstonLogger.verbose!(message, context);

      expect(mockLogger.verbose).toHaveBeenCalledWith(
        'verbose message',
        {
          context,
          additionalData: 'test'
        }
      );
    });
  });

  describe('fatal', () => {
    it('should log string fatal message with context and trace', () => {
      const message = 'fatal message';
      const trace = 'fatal trace';
      const context = 'TestContext';

      winstonLogger.fatal(message, trace, context);

      expect(mockLogger.log).toHaveBeenCalledWith({
        level: 'fatal',
        message,
        context,
        stack: [trace]
      });
    });

    it('should log Error instance as fatal', () => {
      const errorInstance = new Error('test fatal error');
      const context = 'TestContext';

      winstonLogger.fatal(errorInstance, undefined, context);

      expect(mockLogger.log).toHaveBeenCalledWith({
        level: 'fatal',
        message: 'test fatal error',
        context,
        stack: [errorInstance.stack],
        error: errorInstance
      });
    });

    it('should log object as fatal', () => {
      const message = {
        message: 'fatal message',
        additionalData: 'test'
      };
      const trace = 'fatal trace';
      const context = 'TestContext';

      winstonLogger.fatal(message, trace, context);

      expect(mockLogger.log).toHaveBeenCalledWith({
        level: 'fatal',
        message: 'fatal message',
        context,
        stack: [trace],
        additionalData: 'test'
      });
    });

    it('should log object with error property', () => {
      const errorObj = new Error('nested error');
      errorObj.stack = 'error stack line 1\nerror stack line 2';

      const message = {
        message: 'fatal message',
        error: errorObj,
        additionalData: 'test'
      };
      const context = 'TestContext';

      winstonLogger.fatal(message, undefined, context);

      expect(mockLogger.log).toHaveBeenCalledWith({
        level: 'fatal',
        message: 'fatal message',
        context,
        stack: [errorObj.stack],
        error: 'nested error',
        name: 'Error',
        additionalData: 'test'
      });
    });
  });

  describe('getWinstonLogger', () => {
    it('should return the Winston logger instance', () => {
      const logger = winstonLogger.getWinstonLogger();
      expect(logger).toBe(mockLogger);
    });
  });
});
