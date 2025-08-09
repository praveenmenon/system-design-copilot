import { largeBlobsPattern } from '../patterns/large_blobs'
import type { Pattern } from '../patterns/types'

const heuristics = new RegExp(largeBlobsPattern.when_to_apply.join('|'), 'i')

export function selectPatterns(prompt: string): Pattern[] {
  const patterns: Pattern[] = []
  if (prompt.includes('--pattern=large-blobs') || heuristics.test(prompt)) {
    patterns.push(largeBlobsPattern)
  }
  return patterns
}

export function stripPatternFlags(prompt: string): string {
  return prompt.replace(/--pattern=[^\s]+/g, '').trim()
}
