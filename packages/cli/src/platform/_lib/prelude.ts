export const unknownToError = (unknown: unknown): Error => {
  if (unknown instanceof Error) return unknown
  return new Error(`Unknown error: ${unknown}`)
}