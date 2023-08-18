import { Format } from 'logform';
import { NestLikeConsoleFormatOptions } from './winston.interfaces';
import { format } from 'winston';
import { inspect } from 'util';
import safeStringify from 'fast-safe-stringify';

const clc = {
  bold: (text: string) => `\x1B[1m${text}\x1B[0m`,
  green: (text: string) => `\x1B[32m${text}\x1B[39m`,
  yellow: (text: string) => `\x1B[33m${text}\x1B[39m`,
  red: (text: string) => `\x1B[31m${text}\x1B[39m`,
  magentaBright: (text: string) => `\x1B[95m${text}\x1B[39m`,
  cyanBright: (text: string) => `\x1B[96m${text}\x1B[39m`,
};

const nestLikeColorScheme: Record<string, (text: string) => string> = {
  info: clc.green,
  error: clc.red,
  warn: clc.yellow,
  debug: clc.magentaBright,
  verbose: clc.cyanBright,
};

const nestLikeConsoleFormat = (
  appName = 'NestWinston',
  options: NestLikeConsoleFormatOptions = {
    colors: !process.env.NO_COLOR,
    prettyPrint: false,
  },
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
    const color = options.colors && nestLikeColorScheme[level] || ((text: string): string => text);
    const yellow = options.colors ? clc.yellow : ((text: string): string => text);

    const stringifiedMeta = safeStringify(meta);
    const formattedMeta = options.prettyPrint
      ? inspect(JSON.parse(stringifiedMeta), { colors: options.colors, depth: null })
      : stringifiedMeta;

    return (
      `${color(`[${appName}]`)} ` +
      `${yellow(level.charAt(0).toUpperCase() + level.slice(1))}\t` +
      ('undefined' !== typeof timestamp ? `${timestamp} ` : '') +
      ('undefined' !== typeof context
        ? `${yellow('[' + context + ']')} `
        : '') +
      `${color(message)} - ` +
      `${formattedMeta}` +
      ('undefined' !== typeof ms ? ` ${yellow(ms)}` : '')
    );
  });

export const utilities = {
  format: {
    nestLike: nestLikeConsoleFormat,
  },
};
