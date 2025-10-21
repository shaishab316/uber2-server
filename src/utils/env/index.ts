/* eslint-disable no-console */
import fs from 'fs';
import { envPath } from '../../config/configure';
import chalk from 'chalk';

/**
 * Retrieves an environment variable with type checking, error handling, and appending to .env if not found
 *
 * @param key - The key of the environment variable to retrieve
 * @param defaultValue - The default value to return if the environment variable is not found
 * @returns The value of the environment variable or the default value
 */
export default function env<T>(
  envName: string,
  defaultValue?: T,
  options: {
    up?: string;
    down?: string;
    regex?: string;
    comment?: string;
  } = {},
): T {
  options.regex ??= Array.isArray(defaultValue)
    ? '^([a-zA-Z0-9]+,?)+$'
    : typeof defaultValue === 'string'
      ? '^[a-zA-Z0-9]+$'
      : typeof defaultValue === 'number'
        ? '^\\d+$'
        : typeof defaultValue === 'boolean'
          ? '^true|false$'
          : '';

  const key = envName
    .trim()
    .replace(/[-\s]+/g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();
  let value: any = process.env[key];

  if (value === undefined) {
    console.log(
      chalk.yellow(
        `⚠️ Environment variable ${key} is not set, setting to ${defaultValue}`,
      ),
    );

    if (defaultValue === undefined)
      console.error(chalk.red(`❌ Environment variable ${key} is required`));

    if (fs.existsSync(envPath)) {
      const envData = fs.readFileSync(envPath, 'utf8');

      const keyRegex = new RegExp(`^${key} =`, 'm');

      if (!keyRegex.test(envData))
        fs.appendFileSync(
          envPath,
          `${options?.up ? `#${options?.up} \n` : ''}${key} = "${defaultValue}" ${options?.regex ? `# ${options?.comment ? `${options?.comment} --> ` : ''}type: ${getType(defaultValue)}, regex: (/${options?.regex}/)\n` : ''}${options?.down ? `#${options?.down} \n\n\n` : ''}`,
          'utf8',
        );
    } else
      fs.writeFileSync(
        envPath,
        `${options?.up ? `#${options?.up} \n` : ''}${key} = "${defaultValue}" ${options?.regex ? `# ${options?.comment ? `${options?.comment} --> ` : ''}type: ${getType(defaultValue)}, regex: (/${options?.regex}/)\n` : ''}${options?.down ? `#${options?.down} \n\n\n` : ''}`,
        'utf8',
      );

    console.log(
      chalk.green(`✅ Environment variable ${key} set to ${defaultValue}`),
    );

    if (Array.isArray(defaultValue)) value = defaultValue.join(',');
    else value = defaultValue;
  } else {
    const isNotSet = !value;

    if (isNotSet || (options.regex && !new RegExp(options.regex).test(value))) {
      const error = new Error(
        `Environment variable ${chalk.yellow(key)} is not ${isNotSet ? 'set' : 'valid'}`,
      );

      let lineInEnv = 'unknown';
      if (fs.existsSync(envPath)) {
        const envData = fs.readFileSync(envPath, 'utf8').split('\n');
        const index = envData.findIndex(line =>
          line.match(new RegExp(`^\\s*${key}\\s*=`)),
        );
        if (index >= 0) lineInEnv = (index + 1).toString();
      }

      error.stack = `${chalk.yellow(key)} = "${value}" does not match /${options.regex}/
    at env (${envPath}:${lineInEnv}:${key.length + 5})
${new Error().stack?.split('\n')[2] ?? 'unknown'}
    at Object.<anonymous> (${__filename}:90:13)`;

      throw error;
    }
  }

  if (typeof defaultValue === 'boolean')
    return (value?.toString().toLowerCase() === 'true') as T;

  if (typeof defaultValue === 'number') {
    return Number(value) as T;
  }

  if (Array.isArray(defaultValue))
    return (value?.split(',').map((item: string) => item.trim()) ?? []) as T;

  return (value ?? defaultValue) as T;
}

function getType(value: any) {
  if (Array.isArray(value)) return 'array';
  else if (typeof value === 'string') return 'string';
  else if (typeof value === 'number') return 'number';
  else if (typeof value === 'boolean') return 'boolean';
  else return 'unknown';
}
