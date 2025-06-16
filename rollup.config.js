import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import preserveShebang from 'rollup-plugin-preserve-shebang';
import terser from '@rollup/plugin-terser';

export default {
  input: 'demo-cinematic.js',
  output: {
    file: 'dist/demo-cinematic.js',
    format: 'cjs',
    banner: '#!/usr/bin/env node'
  },
  external: [
    '@playwright/test',
    'fs',
    'path',
    'util',
    'http',
    'events'
  ],
  plugins: [
    preserveShebang(),
    nodeResolve({
      preferBuiltins: true
    }),
    commonjs({
      ignoreDynamicRequires: true
    }),
    terser({
      format: {
        comments: false
      }
    })
  ]
};