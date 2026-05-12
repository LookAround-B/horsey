import { TentPeggingScoreInput, TentPeggingScoreResult, TentPeggingRun } from '../types';
import { TP_SCORING, TP_MER_MINIMUM_SCORE } from '../constants';

/**
 * Calculates points for a single tent pegging run.
 */
export function calculateRunPoints(run: TentPeggingRun): number {
  if (run.carried) return TP_SCORING.CLEAN_CARRY;
  if (run.points > 0) return run.points;
  return TP_SCORING.MISS;
}

/**
 * Calculates total points from a set of runs.
 */
export function calculateRunsTotal(runs: TentPeggingRun[]): number {
  return runs.reduce((sum, run) => sum + run.points, 0);
}

/**
 * Validates tent pegging MER requirements (REL 2026).
 *
 * Lance Events: 2 runs on 6cm peg + 1 run on 4cm peg
 * Sword Events: 2 runs on 6cm peg + 1 run on 4cm peg
 * Minimum Score: 24 points (including time penalties)
 */
export function validateMerRuns(runs: TentPeggingRun[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const sixCmRuns = runs.filter((r) => r.pegSize === 6);
  const fourCmRuns = runs.filter((r) => r.pegSize === 4);

  if (sixCmRuns.length < 2) {
    errors.push(`Need at least 2 runs on 6cm peg (have ${sixCmRuns.length})`);
  }
  if (fourCmRuns.length < 1) {
    errors.push(`Need at least 1 run on 4cm peg (have ${fourCmRuns.length})`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Main tent pegging score calculation.
 */
export function calculateTentPeggingScore(
  input: TentPeggingScoreInput,
): TentPeggingScoreResult {
  const lancePoints = calculateRunsTotal(input.lanceRuns);
  const swordPoints = calculateRunsTotal(input.swordRuns);
  const totalPoints = lancePoints + swordPoints;

  // MER: minimum 24 points (including time penalties)
  const achievedMer = totalPoints >= TP_MER_MINIMUM_SCORE;

  return {
    totalPoints,
    lancePoints,
    swordPoints,
    achievedMer,
    isEliminated: false,
  };
}
