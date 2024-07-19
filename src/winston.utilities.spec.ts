import { utilities } from './winston.utilities';
import { TransformableInfo } from 'logform';

describe('nestLikeConsoleFormat', () => {
  const timestamp = new Date().toISOString();
  const pid = String(process.pid);

  it('should use default options if no user options are provided', () => {
    const logFormat = utilities.format.nestLike();
    const info = {
      level: 'info',
      message: 'test message',
      timestamp,
      context: 'TestContext',
    };

    const logMessage = logFormat.transform(info) as TransformableInfo;
    const message = logMessage[Symbol.for('message')];
    expect(message).toContain('[NestWinston]');
    expect(message).toContain(pid);
    expect(message).toContain('LOG');
    expect(message).toContain('test message');
    expect(message).toContain('[TestContext]');
  });

  it('should override default options with user options', () => {
    const customAppName = 'CustomApp';
    const logFormat = utilities.format.nestLike(customAppName, {
      colors: false,
      prettyPrint: false,
      processId: false,
      appName: true,
    });

    const info = {
      level: 'info',
      message: 'test message',
      timestamp,
      context: 'TestContext',
    };

    const logMessage = logFormat.transform(info) as TransformableInfo;
    const message = logMessage[Symbol.for('message')];
    expect(message).toContain(`[${customAppName}]`);
    expect(message).not.toContain(pid);
    expect(message).toContain('LOG');
    expect(message).toContain('test message');
    expect(message).toContain('[TestContext]');
  });

  it('should handle missing options gracefully', () => {
    const logFormat = utilities.format.nestLike('TestApp', {
      prettyPrint: true,
    });

    const info = {
      level: 'info',
      message: 'test message',
      timestamp,
      context: 'TestContext',
    };

    const logMessage = logFormat.transform(info) as TransformableInfo;
    const message = logMessage[Symbol.for('message')];
    expect(message).toContain('[TestApp]');
    expect(message).toContain(pid);
    expect(message).toContain('LOG');
    expect(message).toContain('test message');
    expect(message).toContain('[TestContext]');
  });

  it('should correctly format log levels and timestamps', () => {
    const logFormat = utilities.format.nestLike('TestApp');

    const info = {
      level: 'warn',
      message: 'test warning',
      timestamp,
      context: 'TestContext',
    };

    const logMessage = logFormat.transform(info) as TransformableInfo;
    const message = logMessage[Symbol.for('message')];
    expect(message).toContain('WARN');
    expect(message).toContain(new Date(timestamp).toLocaleString());
    expect(message).toContain('test warning');
  });
});
