import { green, yellow } from 'colors/safe';
import { format } from 'winston';

const nestLikeConsoleFormat = () => format.printf(({ context, level, timestamp, message, ...meta }) => {
  return `${green('[NestWinston]')} ` +
         `${yellow(level.charAt(0).toUpperCase() + level.slice(1))}\t` +
         ('undefined' !== typeof timestamp ? `${new Date(timestamp).toLocaleString()} ` : '') +
         ('undefined' !== typeof context ? `${yellow('[' + context + ']')} ` : '') +
         `${green(message)} - ` +
         `${JSON.stringify(meta)}`;
});

export const utilities = {
  format: {
    nestLike: nestLikeConsoleFormat,
  },
};
