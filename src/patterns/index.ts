// src/patterns/index.ts
import type { Pattern } from './types'
import { largeBlobsPattern } from './large_blobs'
import { realtimeUpdatesPattern } from './realtime_updates'
import { scalingReadsPattern } from './scaling_reads'
import { scalingWritesPattern } from './scaling_writes'
import { dealingWithContentionPattern } from './dealing_with_contention'
import { multiStepProcessesPattern } from './multi_step_processes'
import { longRunningTasksPattern } from './long_running_tasks'

export const patternRegistry: Pattern[] = [
  largeBlobsPattern,
  realtimeUpdatesPattern,
  scalingReadsPattern,
  scalingWritesPattern,
  dealingWithContentionPattern,
  multiStepProcessesPattern,
  longRunningTasksPattern
]

// Optional helper if you want a single call:
export function detectPatterns(prompt: string): Pattern[] {
  const picks = patternRegistry.filter((p) => p.detect(prompt))
  return picks.length ? picks : [scalingReadsPattern] // sane default
}
