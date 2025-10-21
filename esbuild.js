import { build } from 'esbuild';

build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  target: ['node24'],
  outfile: 'dist/server.js',
  sourcemap: false,
  minify: true,
  external: [
    'mongodb',
    'stripe',
    'winston',
    'nodemailer', // keep native Node deps external if needed
  ],
}).catch(() => process.exit(1));
