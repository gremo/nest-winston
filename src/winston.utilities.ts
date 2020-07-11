import { green, yellow } from 'colors/safe';
import { Format } from 'logform';
import { format } from 'winston';
import safeStringify from 'fast-safe-stringify';

const nestLikeConsoleFormat = (appName = 'NestWinston'): Format => format.printf(({ context, level, timestamp, message, ...meta }) => {
  let content = `${green(`[${appName}]`)} ` +
         `${yellow(level.charAt(0).toUpperCase() + level.slice(1))}\t` +
         ('undefined' !== typeof timestamp ? `${new Date(timestamp).toLocaleString()} ` : '') +
         ('undefined' !== typeof context ? `${yellow('[' + context + ']')} ` : '') +
         `${green(message)}`

  if(!(0 === Object.keys(meta).length && meta.constructor === Object)) {
    content = content + ` - ${safeStringify(meta)}`;
  }

  return content
});

export const utilities = {
  format: {
    nestLike: nestLikeConsoleFormat,
  },
};
