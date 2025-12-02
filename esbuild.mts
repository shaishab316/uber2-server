/* eslint-disable no-console */
import chalk from 'chalk';
import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

const startTime = performance.now();

await build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  target: ['node24'],
  format: 'esm',
  outfile: 'dist/server.js',
  sourcemap: false,
  minify: true,
  alias: {
    '@': 'src',
  },
  plugins: [nodeExternalsPlugin()],
});

const endTime = performance.now();

console.log(
  `${chalk.greenBright.bold('✅ Build Complete')} ${chalk.gray(`(${endTime - startTime}ms)`)}`,
);
