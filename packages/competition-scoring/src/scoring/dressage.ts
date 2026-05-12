import {
  DressageScoreInput,
  DressageScoreResult,
  DressageMovementScore,
  DressageCollectiveScore,
  DressageQualityMarks,
} from '../types';
import { EFI_ERROR_DEDUCTIONS, VALID_MARKS, DRESSAGE_THRESHOLDS } from '../constants';

/**
 * Validates a dressage mark is within range and uses 0.5 increments.
 * FEI 26th Edition: marks from 0.0 to 10.0 in half-mark steps.
 */
export function isValidMark(mark: number): boolean {
  return VALID_MARKS.includes(mark);
}

/**
 * Validates all movement marks in a score submission.
 */
export function validateMovementMarks(marks: DressageMovementScore[]): string[] {
  const errors: string[] = [];

  for (const m of marks) {
    if (!isValidMark(m.mark)) {
      errors.push(`Movement ${m.movementNumber}: mark ${m.mark} is invalid (must be 0-10 in 0.5 increments)`);
    }
    if (m.coefficient !== 1 && m.coefficient !== 2) {
      errors.push(`Movement ${m.movementNumber}: coefficient must be 1 or 2`);
    }
  }

  return errors;
}

/**
 * Validates collective marks.
 */
export function validateCollectiveMarks(marks: DressageCollectiveScore[]): string[] {
  const errors: string[] = [];

  for (const m of marks) {
    if (!isValidMark(m.mark)) {
      errors.push(`Collective "${m.name}": mark ${m.mark} is invalid (must be 0-10 in 0.5 increments)`);
    }
  }

  return errors;
}

/**
 * Calculates movement points: mark × coefficient.
 */
export function calculateMovementPoints(mark: number, coefficient: 1 | 2): number {
  return mark * coefficient;
}

/**
 * Calculates the raw score from all movement and collective marks.
 *
 * Step 1: Raw Score = Σ(movement mark × coefficient)
 */
export function calculateRawScore(
  movementMarks: DressageMovementScore[],
  collectiveMarks: DressageCollectiveScore[],
): number {
  const movementTotal = movementMarks.reduce(
    (sum, m) => sum + m.mark * m.coefficient,
    0,
  );

  const collectiveTotal = collectiveMarks.reduce(
    (sum, m) => sum + m.mark * m.coefficient,
    0,
  );

  return movementTotal + collectiveTotal;
}

/**
 * Calculates the maximum possible score for a test sheet.
 */
export function calculateMaxPossible(
  movementMarks: DressageMovementScore[],
  collectiveMarks: DressageCollectiveScore[],
): number {
  const movementMax = movementMarks.reduce(
    (sum, m) => sum + 10 * m.coefficient,
    0,
  );

  const collectiveMax = collectiveMarks.reduce(
    (sum, m) => sum + 10 * m.coefficient,
    0,
  );

  return movementMax + collectiveMax;
}

/**
 * Applies EFI error deductions (REL 2026).
 *
 * IMPORTANT: EFI uses PERCENTAGE-based deductions, NOT mark-based.
 * - 1st error: −0.5 percentage points
 * - 2nd error: −1.0 percentage point
 * - 3rd error: Elimination
 *
 * This differs from FEI international rules which use mark deductions (−2, −4).
 */
export function applyErrorDeductions(
  percentage: number,
  errorCount: number,
): { adjustedPercentage: number; deduction: number; isEliminated: boolean } {
  if (errorCount >= 3) {
    return { adjustedPercentage: percentage, deduction: 0, isEliminated: true };
  }

  let totalDeduction = 0;

  if (errorCount >= 1) {
    totalDeduction += EFI_ERROR_DEDUCTIONS[1];
  }
  if (errorCount >= 2) {
    totalDeduction += EFI_ERROR_DEDUCTIONS[2]!;
  }

  return {
    adjustedPercentage: Math.max(0, percentage - totalDeduction),
    deduction: totalDeduction,
    isEliminated: false,
  };
}

/**
 * Calculates Children-I / Children-II combined Technical + Quality score.
 *
 * EFI Unique:
 * Technical Score = (Raw Score ÷ Max Technical) × 100
 * Quality Score = (Total Quality Marks ÷ 40) × 100
 * TOTAL Score = (Technical % + Quality %) ÷ 2
 */
export function calculateChildrenScore(
  rawScore: number,
  maxScore: number,
  qualityMarks: DressageQualityMarks,
): { technicalScore: number; qualityScore: number; finalPercentage: number } {
  const technicalScore = (rawScore / maxScore) * 100;

  const qualityTotal =
    qualityMarks.position +
    qualityMarks.aids +
    qualityMarks.precision +
    qualityMarks.impression;

  const qualityScore = (qualityTotal / 40) * 100;
  const finalPercentage = (technicalScore + qualityScore) / 2;

  return {
    technicalScore: Number(technicalScore.toFixed(2)),
    qualityScore: Number(qualityScore.toFixed(2)),
    finalPercentage: Number(finalPercentage.toFixed(2)),
  };
}

/**
 * Main dressage score calculation.
 *
 * Follows the official calculation pipeline:
 * Step 1: Raw Score = Σ(movement mark × coefficient)
 * Step 2: Judge % = (Raw Score ÷ Maximum Possible) × 100  (2 decimal places)
 * Step 3: Apply EFI error deductions (percentage-based)
 * Step 4: Eventing Penalties = 100 − Final %  (1 decimal place)
 */
export function calculateDressageScore(input: DressageScoreInput): DressageScoreResult {
  // Validate
  const movementErrors = validateMovementMarks(input.movementMarks);
  const collectiveErrors = validateCollectiveMarks(input.collectiveMarks);

  if (movementErrors.length > 0 || collectiveErrors.length > 0) {
    throw new Error(
      `Validation failed: ${[...movementErrors, ...collectiveErrors].join('; ')}`,
    );
  }

  // Step 1: Raw Score
  const rawScore = calculateRawScore(input.movementMarks, input.collectiveMarks);
  const maxPossible = calculateMaxPossible(input.movementMarks, input.collectiveMarks);

  // Step 2: Judge Percentage (2 decimal places)
  const percentage = Number(((rawScore / maxPossible) * 100).toFixed(2));

  // Step 3: Apply EFI error deductions
  const { adjustedPercentage, deduction, isEliminated } = applyErrorDeductions(
    percentage,
    input.errorCount,
  );

  const finalPercentage = Number(adjustedPercentage.toFixed(2));

  // Step 4: Eventing Penalties (1 decimal place)
  const eventingPenalties = Number((100 - finalPercentage).toFixed(1));

  // Handle Children categories with quality marks
  let technicalScore: number | undefined;
  let qualityScore: number | undefined;

  if (input.qualityMarks) {
    const childrenResult = calculateChildrenScore(rawScore, maxPossible, input.qualityMarks);
    technicalScore = childrenResult.technicalScore;
    qualityScore = childrenResult.qualityScore;
  }

  // MER check: minimum 57% score in REL for dressage
  const achievedMer = !isEliminated && finalPercentage >= DRESSAGE_THRESHOLDS.MER_MINIMUM;

  return {
    rawScore,
    maxPossible,
    percentage,
    technicalScore,
    qualityScore,
    errorDeductions: deduction,
    finalPercentage,
    eventingPenalties,
    achievedMer,
    isEliminated,
    eliminationReason: isEliminated ? 'Third error of course' : undefined,
  };
}

/**
 * Calculates the final averaged percentage across multiple judges.
 *
 * Step 3 from the official pipeline:
 * Final % = Σ(Judge Percentages) ÷ Number of Judges  (2 decimal places)
 */
export function calculateAveragePercentage(judgePercentages: number[]): number {
  if (judgePercentages.length === 0) return 0;
  const sum = judgePercentages.reduce((a, b) => a + b, 0);
  return Number((sum / judgePercentages.length).toFixed(2));
}
