import type { Plugin } from 'esbuild'

const externalPlugin: Plugin = {
  name: 'externalPlugin',
  setup(build) {
    const filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/ // Must not start with "/" or "./" or "../"
    build.onResolve({ filter }, (args) => ({ path: args.path, external: true }))
  },
}

export { externalPlugin }
