/**
 * Eventing scoring: three-phase combined penalties.
 *
 * Total Penalties = Dressage Penalties + XC Penalties + SJ Penalties
 * Winner = Lowest total penalties
 */

export interface CrossCountryFault {
  type: 'refusal' | 'fall' | 'time';
  value: number;
}

export const XC_PENALTIES = {
  FIRST_REFUSAL: 20,
  SECOND_REFUSAL_SAME_FENCE: 40,
  THIRD_REFUSAL: null, // Elimination
  FALL_OF_RIDER: null, // Elimination
  TIME_FAULT_PER_SECOND: 0.4,
} as const;

/**
 * Calculates cross-country penalties.
 */
export function calculateXCPenalties(
  refusals: number,
  timeFaults: number,
  hasFallen: boolean,
): {
  penalties: number;
  isEliminated: boolean;
  eliminationReason?: string;
} {
  if (hasFallen) {
    return {
      penalties: 0,
      isEliminated: true,
      eliminationReason: 'Fall of rider',
    };
  }

  if (refusals >= 3) {
    return {
      penalties: 0,
      isEliminated: true,
      eliminationReason: 'Third refusal',
    };
  }

  let penalties = 0;
  if (refusals >= 1) penalties += XC_PENALTIES.FIRST_REFUSAL;
  if (refusals >= 2) penalties += XC_PENALTIES.SECOND_REFUSAL_SAME_FENCE;

  // Time penalties: 0.4 per second over optimum
  penalties += timeFaults * XC_PENALTIES.TIME_FAULT_PER_SECOND;

  return { penalties: Number(penalties.toFixed(1)), isEliminated: false };
}

/**
 * Calculates eventing total penalties from all three phases.
 *
 * Dressage penalties = 100 − dressage percentage (1 decimal place)
 */
export function calculateEventingTotal(
  dressagePenalties: number,
  xcPenalties: number,
  sjFaults: number,
): number {
  return Number((dressagePenalties + xcPenalties + sjFaults).toFixed(1));
}

/**
 * Eventing tiebreaker comparison.
 * Winner = lowest total penalties.
 */
export function compareEventingScores(
  a: { totalPenalties: number; isEliminated: boolean },
  b: { totalPenalties: number; isEliminated: boolean },
): number {
  if (a.isEliminated && !b.isEliminated) return 1;
  if (!a.isEliminated && b.isEliminated) return -1;
  if (a.isEliminated && b.isEliminated) return 0;
  return a.totalPenalties - b.totalPenalties;
}
