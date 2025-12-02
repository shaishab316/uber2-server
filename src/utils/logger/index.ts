/* eslint-disable no-console */
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '@/config';
import stripAnsi from 'strip-ansi';
import path from 'path';

const { combine, timestamp, label, printf } = format;

const logDir = path.resolve(process.cwd(), 'logs');

// Format for console (keeps colors)
const consoleFormat = combine(
  label({ label: config.server.name }),
  timestamp(),
  printf(
    ({ level, message, label, timestamp }) =>
      `${timestamp} [${label}] ${level}: ${message}`,
  ),
);

// Format for file (removes colors)
const fileFormat = combine(
  label({ label: config.server.name }),
  timestamp(),
  format(info => {
    info.message = stripAnsi(info.message as string); // remove ANSI colors
    return info;
  })(),
  printf(
    ({ level, message, label, timestamp }) =>
      `${timestamp} [${label}] ${level}: ${message}`,
  ),
);

/**
 * Logger for info messages
 */
export const logger = createLogger({
  level: 'info',
  transports: [
    new transports.Console({ format: consoleFormat }),
    new DailyRotateFile({
      filename: path.join(logDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'info',
      format: fileFormat,
    }),
  ],
});

/**
 * Logger for error messages
 */
export const errorLogger = createLogger({
  level: 'error',
  transports: [
    new transports.Console({ format: consoleFormat }),
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d',
      level: 'error',
      format: fileFormat,
    }),
  ],
});
