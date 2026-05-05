import { ShowJumpingScoreInput, ShowJumpingScoreResult } from '../types';
import { SJ_FAULT_TYPES, SJ_MER_MAX_FAULTS } from '../constants';

/**
 * Calculates time faults for show jumping.
 * 1 fault per second over time allowed.
 */
export function calculateTimeFaults(roundTime: number, timeAllowed: number): number {
  if (roundTime <= timeAllowed) return 0;
  return Math.ceil(roundTime - timeAllowed);
}

/**
 * Calculates refusal faults.
 * 1st refusal = 4 faults, 2nd = 8 faults (cumulative), 3rd = elimination
 */
export function calculateRefusalFaults(refusals: number): {
  faults: number;
  isEliminated: boolean;
  eliminationReason?: string;
} {
  if (refusals >= 3) {
    return {
      faults: 0,
      isEliminated: true,
      eliminationReason: 'Third refusal – elimination',
    };
  }

  let faults = 0;
  if (refusals >= 1) faults += SJ_FAULT_TYPES.FIRST_REFUSAL;
  if (refusals >= 2) faults += SJ_FAULT_TYPES.SECOND_REFUSAL;

  return { faults, isEliminated: false };
}

/**
 * Checks if round time exceeds the time limit (2× Time Allowed).
 */
export function isOverTimeLimit(roundTime: number, timeAllowed: number): boolean {
  return roundTime > timeAllowed * 2;
}

/**
 * Main show jumping score calculation.
 *
 * Table A scoring (REL standard):
 * Total Faults = Knockdown Faults + Refusal Faults + Time Faults
 *
 * Tiebreaker: fewest faults → fastest jump-off → fastest round time
 */
export function calculateShowJumpingScore(
  input: ShowJumpingScoreInput,
): ShowJumpingScoreResult {
  // Check time limit (2× time allowed = elimination)
  if (isOverTimeLimit(input.roundTime, input.timeAllowed)) {
    return {
      totalFaults: 0,
      timeFaults: 0,
      refusalFaults: 0,
      knockdownFaults: input.faults,
      roundTime: input.roundTime,
      jumpOffFaults: input.jumpOffFaults,
      jumpOffTime: input.jumpOffTime,
      isEliminated: true,
      eliminationReason: 'Exceeded time limit (2× time allowed)',
      achievedMer: false,
    };
  }

  // Calculate refusal faults
  const refusalResult = calculateRefusalFaults(input.refusals);
  if (refusalResult.isEliminated) {
    return {
      totalFaults: 0,
      timeFaults: 0,
      refusalFaults: 0,
      knockdownFaults: input.faults,
      roundTime: input.roundTime,
      jumpOffFaults: input.jumpOffFaults,
      jumpOffTime: input.jumpOffTime,
      isEliminated: true,
      eliminationReason: refusalResult.eliminationReason,
      achievedMer: false,
    };
  }

  // Calculate time faults
  const timeFaults = calculateTimeFaults(input.roundTime, input.timeAllowed);

  // Total faults (Table A)
  const totalFaults = input.faults + refusalResult.faults + timeFaults;

  // MER: max 8 jumping penalties excluding time faults
  const jumpingPenaltiesExclTime = input.faults + refusalResult.faults;
  const achievedMer = jumpingPenaltiesExclTime <= SJ_MER_MAX_FAULTS;

  return {
    totalFaults,
    timeFaults,
    refusalFaults: refusalResult.faults,
    knockdownFaults: input.faults,
    roundTime: input.roundTime,
    jumpOffFaults: input.jumpOffFaults,
    jumpOffTime: input.jumpOffTime,
    isEliminated: false,
    achievedMer,
  };
}

/**
 * Show Jumping tiebreaker comparison.
 *
 * 1. Fewest total faults
 * 2. Fastest time in jump-off (if held)
 * 3. Fastest round time (if no jump-off)
 *
 * Returns negative if a ranks higher, positive if b ranks higher, 0 if tied.
 */
export function compareShowJumpingScores(
  a: ShowJumpingScoreResult,
  b: ShowJumpingScoreResult,
): number {
  // Eliminated entries rank last
  if (a.isEliminated && !b.isEliminated) return 1;
  if (!a.isEliminated && b.isEliminated) return -1;
  if (a.isEliminated && b.isEliminated) return 0;

  // 1. Fewest total faults
  if (a.totalFaults !== b.totalFaults) {
    return a.totalFaults - b.totalFaults;
  }

  // 2. Jump-off comparison (if both have jump-off data)
  if (a.jumpOffFaults != null && b.jumpOffFaults != null) {
    if (a.jumpOffFaults !== b.jumpOffFaults) {
      return a.jumpOffFaults - b.jumpOffFaults;
    }
    if (a.jumpOffTime != null && b.jumpOffTime != null) {
      return a.jumpOffTime - b.jumpOffTime;
    }
  }

  // 3. Fastest round time
  return a.roundTime - b.roundTime;
}
