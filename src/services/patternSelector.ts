import type { Pattern } from '../patterns/types'
import { patternRegistry } from '../patterns'

function extractPatternFlags(prompt: string): string[] {
  const match = prompt.match(/--patterns?=([^\s]+)/)
  return match ? match[1].split(',') : []
}

export function stripPatternFlags(prompt: string): string {
  return prompt.replace(/--patterns?=[^\s]+/g, '').trim()
}

export function selectPatterns(prompt: string): Pattern[] {
  const flags = extractPatternFlags(prompt)
  const cleaned = stripPatternFlags(prompt)
  return patternRegistry.filter(p => flags.includes(p.id) || p.detect(cleaned))
}
