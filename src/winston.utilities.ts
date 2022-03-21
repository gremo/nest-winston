import { ChalkInstance } from 'chalk';
import { Format } from 'logform';
import { NestLikeConsoleFormatOptions } from './winston.interfaces';
import clc from 'chalk';
import { format } from 'winston';
import { inspect } from 'util';
import safeStringify from 'fast-safe-stringify';

const nestLikeColorScheme: Record<string, ChalkInstance> = {
  info: clc.greenBright,
  error: clc.red,
  warn: clc.yellow,
  debug: clc.magentaBright,
  verbose: clc.cyanBright,
};

const nestLikeConsoleFormat = (
  appName = 'NestWinston',
  options?: NestLikeConsoleFormatOptions
): Format =>
  format.printf(({ context, level, timestamp, message, ms, ...meta }) => {
    if ('undefined' !== typeof timestamp) {
      // Only format the timestamp to a locale representation if it's ISO 8601 format. Any format
      // that is not a valid date string will throw, just ignore it (it will be printed as-is).
      try {
        if (timestamp === new Date(timestamp).toISOString()) {
          timestamp = new Date(timestamp).toLocaleString();
        }
      } catch (error) {
        // eslint-disable-next-line no-empty
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const color = nestLikeColorScheme[level] || ((text: string): string => text);

    const stringifiedMeta = safeStringify(meta);
    const formattedMeta = options?.prettyPrint
      ? inspect(JSON.parse(stringifiedMeta), { colors: true, depth: null })
      : stringifiedMeta;

    return (
      `${color(`[${appName}]`)} ` +
      `${clc.yellow(level.charAt(0).toUpperCase() + level.slice(1))}\t` +
      ('undefined' !== typeof timestamp ? `${timestamp} ` : '') +
      ('undefined' !== typeof context
        ? `${clc.yellow('[' + context + ']')} `
        : '') +
      `${color(message)} - ` +
      `${formattedMeta}` +
      ('undefined' !== typeof ms ? ` ${clc.yellow(ms)}` : '')
    );
  });

export const utilities = {
  format: {
    nestLike: nestLikeConsoleFormat,
  },
};
