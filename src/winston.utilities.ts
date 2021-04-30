import { Format } from 'logform';
import bare from 'cli-color/bare';
import clc from 'cli-color';
import { format } from 'winston';
import safeStringify from 'fast-safe-stringify';

const nestLikeColorScheme: Record<string, bare.Format> = {
  info: clc.greenBright,
  error: clc.red,
  warn: clc.yellow,
  debug: clc.magentaBright,
  verbose: clc.cyanBright,
};

const nestLikeConsoleFormat = (appName = 'NestWinston'): Format => format.printf(({ context, level, timestamp, message, ms, ...meta }) => {
  if ('undefined' !== typeof timestamp) {
    // Only format the timestamp to a locale representation if it's ISO 8601 format. Any format
    // that is not a valid date string will throw, just ignore it (it will be printed as-is).
    try {
      if (timestamp === (new Date(timestamp)).toISOString()) {
        timestamp = (new Date(timestamp)).toLocaleString();
      }
    } catch (error) { // eslint-disable-next-line no-empty
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const color = nestLikeColorScheme[level] || ((text: string): string => text);

  return `${color(`[${appName}]`)} ` +
         `${clc.yellow(level.charAt(0).toUpperCase() + level.slice(1))}\t` +
         ('undefined' !== typeof timestamp ? `${timestamp} ` : '') +
         ('undefined' !== typeof context ? `${clc.yellow('[' + context + ']')} ` : '') +
         `${color(message)} - ` +
         `${safeStringify(meta)}` +
         ('undefined' !== typeof ms ? ` ${clc.yellow(ms)}` : '');
});

export const utilities = {
  format: {
    nestLike: nestLikeConsoleFormat,
  },
};
