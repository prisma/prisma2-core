import path from 'path'

import { Fillers, load } from '../fillPlugin'

const edgePreset: Fillers = {
  // enabled
  // assert: { path: load('assert-browserify') },
  buffer: { path: path.join(__dirname, 'edge', 'buffer.js') },
  // constants: { path: load('constants-browserify') },
  // crypto: { path: load('crypto-browserify') },
  // domain: { path: load('domain-browser') },
  events: { path: load('eventemitter3') },
  // http: { path: load('stream-http') },
  // https: { path: load('https-browserify') },
  // inherits: { path: load('inherits') },
  // os: { path: load('os-browserify') },
  path: { path: load('path-browserify') },
  // punycode: { path: load('punycode') },
  // querystring: { path: load('querystring-es3') },
  // stream: { path: load('readable-stream') },
  // string_decoder: { path: load('string_decoder') },
  // sys: { path: load('util') },
  // timers: { path: load('timers-browserify') },
  tty: { path: load('tty-browserify') },
  // url: { path: load('url') },
  util: { path: path.join(__dirname, 'edge', 'util.ts') },
  // vm: { path: load('vm-browserify') },
  // zlib: { path: load('browserify-zlib') },

  // disabled
  constants: { contents: '' },
  crypto: { contents: '' },
  domain: { contents: '' },
  http: { contents: '' },
  https: { contents: '' },
  inherits: { contents: '' },
  os: { contents: '' },
  punycode: { contents: '' },
  querystring: { contents: '' },
  stream: { contents: '' },
  string_decoder: { contents: '' },
  sys: { contents: '' },
  timers: { contents: '' },
  url: { contents: '' },
  vm: { contents: '' },
  zlib: { contents: '' },

  // no shims
  async_hooks: { contents: '' },
  child_process: { contents: '' },
  cluster: { contents: '' },
  dns: { contents: '' },
  dgram: { contents: '' },
  fs: { path: path.join(__dirname, 'edge', 'fs.ts') },
  http2: { contents: '' },
  module: { contents: '' },
  net: { contents: '' },
  perf_hooks: { path: path.join(__dirname, 'edge', 'perf_hooks.ts') },
  readline: { contents: '' },
  repl: { contents: '' },
  tls: { contents: '' },

  // globals
  Buffer: {
    inject: path.join(__dirname, 'edge', 'buffer.js'),
  },
  process: {
    inject: path.join(__dirname, 'edge', 'process.ts'),
    path: path.join(__dirname, 'edge', 'process.ts'),
  },
  __dirname: { define: '"/"' },
  __filename: { define: '"index.js"' },

  // we remove eval and Function for vercel edge
  eval: { define: 'undefined' },
  Function: {
    define: 'fn',
    inject: path.join(__dirname, 'edge', 'function.ts'),
  },

  // we shim WeakRef, it does not exist on CF
  WeakRef: {
    inject: path.join(__dirname, 'edge', 'weakref.ts'),
  },
}

export { edgePreset }
