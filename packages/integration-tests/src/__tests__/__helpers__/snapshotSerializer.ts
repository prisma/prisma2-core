import path from 'path'
import replaceAll from 'replace-string' // sindre's replaceAll polyfill
import stripAnsi from 'strip-ansi'
import { platforms } from '@prisma/get-platform'
import escapeString from 'escape-string-regexp'

function trimErrorPaths(str) {
  const parentDir = path.dirname(path.dirname(__dirname))

  return replaceAll(str, parentDir, '')
}

function normalizeToUnixPaths(str) {
  return replaceAll(str, path.sep, '/')
}

const platformRegex = new RegExp(
  '(' + platforms.map((p) => escapeString(p)).join('|') + ')',
  'g',
)

function removePlatforms(str) {
  return str.replace(platformRegex, 'TEST_PLATFORM')
}

function normalizeGithubLinks(str) {
  return str.replace(
    /https:\/\/github.com\/prisma\/prisma-client-js\/issues\/\S+/,
    'TEST_GITHUB_LINK',
  )
}

function normalizeRustError(str) {
  return str
    .replace(/\/rustc\/(.+)\//g, '/rustc/hash/')
    .replace(/(\[.*)(:\d*:\d*)(\])/g, '[/some/rust/path:0:0$3')
}

function normalizeTmpDir(str) {
  return str.replace(/\/tmp\/([a-z0-9]+)\//g, '/tmp/dir/')
}

/**
 * Replace dynamic variable bits of Prisma Schema with static strings.
 */
function prepareSchemaForSnapshot(schema: string): string {
  const urlRegex = /url\s*=\s*.+/
  const outputRegex = /output\s*=\s*.+/
  return schema
    .split('\n')
    .map((line) => {
      const urlMatch = urlRegex.exec(line)
      if (urlMatch) {
        return `${line.slice(0, urlMatch.index)}url = "***"`
      }
      const outputMatch = outputRegex.exec(line)
      if (outputMatch) {
        return `${line.slice(0, outputMatch.index)}output = "***"`
      }
      return line
    })
    .join('\n')
}

export function test(value) {
  return typeof value === 'string' || value instanceof Error
}

export function serialize(value) {
  const message =
    typeof value === 'string'
      ? value
      : value instanceof Error
      ? value.message
      : ''
  return prepareSchemaForSnapshot(
    normalizeGithubLinks(
      normalizeRustError(
        normalizeTmpDir(
          normalizeGithubLinks(
            normalizeToUnixPaths(
              removePlatforms(trimErrorPaths(stripAnsi(message))),
            ),
          ),
        ),
      ),
    ),
  )
}
