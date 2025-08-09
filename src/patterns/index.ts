import type { PatternOutput } from "@/design/types";
import { largeBlobs } from "./large-blobs";
import { realtimeUpdates } from "./realtime-updates";
import { scalingReads } from "./scaling-reads";
import { scalingWrites } from "./scaling-writes";
import { dealingWithContention } from "./dealing-with-contention";
import { multiStepProcesses } from "./multi-step-processes";
import { longRunningTasks } from "./long-running-tasks";

const ALL: PatternOutput[] = [largeBlobs, realtimeUpdates, scalingReads, scalingWrites, dealingWithContention, multiStepProcesses, longRunningTasks];

export function selectPatterns(prompt: string, forceIds: string[] = []): PatternOutput[] {
  const picks = [
    ...ALL.filter(p => forceIds.includes(p.id)),
    ...ALL.filter(p => p.meta?.detect?.(prompt))
  ];
  const uniq = [...new Map(picks.map(p => [p.id, p])).values()];
  return uniq.length ? uniq : [scalingReads];
}
