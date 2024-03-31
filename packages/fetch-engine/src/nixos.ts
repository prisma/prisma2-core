import Debug from '@prisma/debug'
import { BinaryTarget } from '@prisma/get-platform'
import fetch from 'node-fetch'
import pRetry from 'p-retry'
import fs from 'fs/promises'

import { getProxyAgent } from './getProxyAgent'
import { getCacheDir } from './utils'
import path from 'path'

const debug = Debug('prisma:fetch-engine:nix')

/**
 * Checks if the given binary target is NixOS.
 */
export function isNixOsTarget(target: BinaryTarget): boolean {
  return target === 'linux-nixos' || target === 'linux-nixos-arm64'
}

/**
 * Translates a user-facing binary target to one of those we build and distribute.
 * For NixOS targets, returns a binary target that is compatible after packaging
 * it with Nix. Returns all other binary targets unchanged.
 */
export function getDownloadableBinaryTarget(target: BinaryTarget): BinaryTarget {
  const nixosToNormalTargetMap: Partial<Record<BinaryTarget, BinaryTarget>> = {
    'linux-nixos': 'debian-openssl-3.0.x',
    'linux-nixos-arm64': 'linux-arm64-openssl-3.0.x',
  }
  return nixosToNormalTargetMap[target] ?? target
}

/*
{
  binaryName: 'libquery-engine',
  targetFolder: '/home/aqrln/prisma/prisma/packages/engines/',
  binaryTarget: 'linux-nixos-arm64',
  fileName: 'libquery_engine-linux-nixos-arm64.so.node',
  targetFilePath: '/home/aqrln/prisma/prisma/packages/engines/libquery_engine-linux-nixos-arm64.so.node',
  envVarPath: undefined,
  skipCacheIntegrityCheck: false
}
*/

type NixDownloadJob = {
  binaryName: string
  version: string
  fileName: string
  binaryTarget: BinaryTarget
  downloadUrl: string
  progressCb: ((value: number) => void) | undefined
}

/**
 */
export async function fetchEngineWithNix(job: NixDownloadJob): Promise<void> {
  const { progressCb, binaryName, version, fileName, downloadUrl } = job

  if (progressCb) {
    progressCb(0)
  }

  const sha256 = await fetchSha256Hash(job)

  if (progressCb) {
    progressCb(1)
  }
}

/**
 * Fetches the sha256 hash of the gzipped engine binary.
 * We are not reusing the existing `fetchChecksum` function from `downloadZip.ts`
 * because the logic here is different.
 * First of all, we cannot ignore missing checksums for NixOS binary targets, even
 * if the environment variable `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING` is set.
 * Without knowing the hash of the binary, we cannot build the Nix derivation
 * ... todo ...
 */
async function fetchSha256Hash(job: NixDownloadJob): Promise<string> {
  const { downloadUrl, version, binaryTarget, binaryName } = job

  const hashUrl = `${downloadUrl}.gz.sha256`
  const RETRIES_COUNT = 2

  const cacheDir = await getCacheDir('master', version, binaryTarget)
  const cachedHashFilename = cacheDir !== null ? path.join(cacheDir, `${binaryName}.gz.sha256`) : null

  const fetchFromNetworkPromise = pRetry(
    async () => {
      const res = await fetch(hashUrl, {
        agent: getProxyAgent(hashUrl),
      })

      if (!res.ok) {
        throw new Error(`Failed to download sha256 hash from ${hashUrl}: ${res.status} ${res.statusText}`)
      }

      const body = await res.text()

      const [hash] = body.split(/\s+/)
      if (!/^[a-f0-9]{64}$/gi.test(hash)) {
        throw new Error(
          `Failed to parse hash from ${hashUrl} which must be 32 bytes encoded as hexadecimal string, got: "${body}"`,
        )
      }

      if (cachedHashFilename) {
        try {
          await fs.writeFile(cachedHashFilename, hash, 'utf-8')
        } catch (e) {
          debug(`Failed to write sha256 hash to cache: ${e.message}`)
        }
      }

      return hash
    },
    {
      retries: RETRIES_COUNT,
      onFailedAttempt: (error) => {
        debug(`Failed to download and parse sha256 hash from ${hashUrl}: ${error.message}`)
      },
    },
  )

  try {
    return await fetchFromNetworkPromise
  } catch (networkError) {
    if (cachedHashFilename === null) {
      throw networkError
    }
    try {
      return await fs.readFile(cachedHashFilename, 'utf-8')
    } catch {
      throw networkError
    }
  }
}

type BuildNixDerivationOptions = {
  binaryName: string
  version: string
  fileName: string
  downloadUrl: string
  progressCb: ((value: number) => void) | undefined
}

export function buildNixDerivation() {}

type MakeNixExpressionOptions = {
  version: string
  fileName: string
  downloadUrl: string
  gzipSha256: string
}

function makeNixExpression({ version, fileName, downloadUrl, gzipSha256 }: MakeNixExpressionOptions): string {
  return `
{ pkgs ? import <nixpkgs> {} }:

pkgs.stdenv.mkDerivation {
  name = "prisma-engines-${version}-${fileName}";

  src = pkgs.fetchurl {
    url = "${downloadUrl}.gz";
    sha256 = "${encodeSha256ForNix(gzipSha256)}";
  };

  buildInputs = with pkgs; [ libgcc openssl ];
  nativeBuildInputs = [ pkgs.autoPatchelfHook ];

  sourceRoot = ".";
  dontConfigure = true;
  dontBuild = true;

  unpackCmd = ''
    gunzip -c $src > ${fileName}
  '';

  installPhase = ''
    install -m 755 ${fileName} $out
  '';
}`
}

function encodeSha256ForNix(prismaSha256: string): string {
  const bytes = Buffer.from(prismaSha256, 'hex')
  return 'sha256-' + bytes.toString('base64')
}
