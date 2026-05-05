// ─── EFI Regional Zones ─────────────────────────────────────────────────

export const EFI_ZONES = {
  NORTH: ['Jammu & Kashmir', 'Himachal Pradesh', 'Punjab', 'Haryana', 'Chandigarh', 'Delhi'],
  EAST: ['West Bengal', 'Bihar', 'Jharkhand', 'Odisha'],
  WEST: ['Maharashtra', 'Goa', 'Gujarat', 'Rajasthan'],
  SOUTH: ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Puducherry'],
  CENTRAL: ['Uttar Pradesh', 'Madhya Pradesh', 'Chhattisgarh', 'Uttarakhand'],
  NORTH_EAST: ['Assam', 'Manipur', 'Nagaland', 'Sikkim', 'Arunachal Pradesh', 'Tripura', 'Meghalaya', 'Mizoram'],
} as const;

// ─── Dressage Scoring Constants ─────────────────────────────────────────

export const DRESSAGE_MARK_SCALE = {
  0: 'Not Performed',
  1: 'Very Bad',
  2: 'Bad',
  3: 'Fairly Bad',
  4: 'Insufficient',
  5: 'Sufficient',
  6: 'Satisfactory',
  7: 'Fairly Good',
  8: 'Good',
  9: 'Very Good',
  10: 'Excellent',
} as const;

/** Half-marks allowed: 0, 0.5, 1, 1.5, ..., 10 */
export const VALID_MARKS = Array.from({ length: 21 }, (_, i) => i * 0.5);

export const DRESSAGE_COLLECTIVES = [
  { name: 'Gaits (Paces)', coefficient: 2 as const, description: 'Freedom, regularity, quality of walk/trot/canter' },
  { name: 'Impulsion', coefficient: 2 as const, description: 'Desire to move forward, elasticity, engagement' },
  { name: 'Submission', coefficient: 2 as const, description: 'Attention, harmony, lightness, acceptance of contact' },
  { name: "Rider's Position & Seat", coefficient: 1 as const, description: 'Posture, alignment, stability, independent seat' },
  { name: "Rider's Use of Aids", coefficient: 1 as const, description: 'Correct, effective, clear use of leg/rein/seat aids' },
] as const;

/**
 * EFI error deductions (REL 2026) — percentage-based, NOT mark-based.
 * Differs from FEI international rules which use mark deductions (−2, −4).
 */
export const EFI_ERROR_DEDUCTIONS = {
  1: 0.5,   // First error: −0.5 percentage points
  2: 1.0,   // Second error: −1.0 percentage point
  3: null,  // Third error: Elimination
} as const;

/** Thresholds */
export const DRESSAGE_THRESHOLDS = {
  LEVEL_UP: 60,
  COMFORTABLE_PROGRESS: 65,
  GRAND_PRIX_MIN: 65,
  MER_MINIMUM: 57,
} as const;

// ─── EFI Age Categories ─────────────────────────────────────────────────

export const AGE_CATEGORIES = {
  CHILDREN_II: { minAge: 10, maxAge: 12, label: 'Children-II' },
  CHILDREN_I: { minAge: 12, maxAge: 14, label: 'Children-I' },
  JUNIOR: { minAge: 14, maxAge: 18, label: 'Junior' },
  YOUNG_RIDER: { minAge: 16, maxAge: 21, label: 'Young Rider' },
  SENIOR: { minAge: 18, maxAge: null, label: 'Senior' },
} as const;

// ─── Show Jumping Constants ─────────────────────────────────────────────

export const SJ_FAULT_TYPES = {
  KNOCKDOWN: 4,
  FIRST_REFUSAL: 4,
  SECOND_REFUSAL: 8,
  THIRD_REFUSAL: null,   // Elimination
  FALL_OF_RIDER: null,   // Elimination
  TIME_FAULT_PER_SEC: 1,
  JUMP_OFF_TIME_FAULT_PER_4SEC: 1,
} as const;

export const SJ_COURSE_SPECS = {
  CHILDREN_II: {
    heightMin: 70, heightMax: 80, spread: 90,
    speed: 325, timeAllowed: 84, arenaMin: '65×50',
    obstacles: 11, efforts: [12, 13], combinations: [1, 2],
    courseLength: 455,
  },
  CHILDREN_I: {
    heightMin: 80, heightMax: 90, spread: 105,
    speed: 325, timeAllowed: 84, arenaMin: '65×50',
    obstacles: 11, efforts: [12, 13], combinations: [1, 2],
    courseLength: 455,
  },
  JUNIOR: {
    heightMin: 100, heightMax: 105, spread: 125,
    speed: 350, timeAllowed: 78, arenaMin: '65×50',
    obstacles: 11, efforts: [12, 13], combinations: [1, 2],
    courseLength: 455,
  },
  YOUNG_RIDER: {
    heightMin: 105, heightMax: 115, spread: 135,
    speed: 350, timeAllowed: 78, arenaMin: '65×50',
    obstacles: 11, efforts: [12, 13], combinations: [1, 2],
    courseLength: 455,
  },
} as const;

export const SJ_MER_MAX_FAULTS = 8; // Max 8 jumping penalties (excl. time)

// ─── Tent Pegging Constants ─────────────────────────────────────────────

export const TP_SCORING = {
  CLEAN_CARRY: 10,
  PEG_HIT_NOT_CARRIED: 5,
  RING_COLLECTION: 10,
  LEMON_SLICE: 10,
  MISS: 0,
} as const;

export const TP_MER_MINIMUM_SCORE = 24;

// ─── EFI Dressage Test Sheets ───────────────────────────────────────────

export const EFI_TEST_SHEETS = {
  YOUNG_RIDER: { appendix: 'A', movements: 27, maxScore: 290, time: "6'30\"" },
  JUNIOR: { appendix: 'C', movements: 19, maxScore: 250, time: "3'55\"" },
  CHILDREN_I: { appendix: 'D', movements: 22, maxScore: 290, time: "5'00\"" },
  CHILDREN_II: { appendix: 'E', movements: 18, maxScore: 210, time: "4'00\"" },
} as const;

// ─── Horse Usage Limits ─────────────────────────────────────────────────

export const HORSE_DAILY_LIMITS = {
  MAX_DRESSAGE: 2,
  MAX_JUMPING: 2,
  /** Combined rule: 2× Dressage + 1× Jumping OR 2× Jumping + 1× Dressage */
  MAX_TOTAL: 3,
} as const;

// ─── Horse Age Requirements ─────────────────────────────────────────────

export const HORSE_AGE_REQUIREMENTS = {
  YOUNG_RIDER: 7,
  JUNIOR: 6,
  CHILDREN_I_CHILD: 6,
  CHILDREN_I_ADULT: 5,
  CHILDREN_II_CHILD: 6,
  CHILDREN_II_ADULT: 5,
} as const;

// ─── Competition Levels ─────────────────────────────────────────────────

export const COMPETITION_LEVELS = [
  { key: 'INTRODUCTORY', label: 'Introductory', arena: 'SMALL_20x40', qualifyScore: 60 },
  { key: 'PRELIMINARY', label: 'Preliminary', arena: 'SMALL_20x40', qualifyScore: 60 },
  { key: 'NOVICE', label: 'Novice', arena: 'SMALL_20x40', qualifyScore: 60 },
  { key: 'ELEMENTARY', label: 'Elementary', arena: 'STANDARD_20x60', qualifyScore: 60 },
  { key: 'MEDIUM', label: 'Medium', arena: 'STANDARD_20x60', qualifyScore: 60 },
  { key: 'ADVANCED', label: 'Advanced', arena: 'STANDARD_20x60', qualifyScore: 60 },
  { key: 'PRIX_ST_GEORGES', label: 'Prix St-Georges', arena: 'STANDARD_20x60', qualifyScore: 60 },
  { key: 'INTERMEDIATE_I', label: 'Intermediate I', arena: 'STANDARD_20x60', qualifyScore: 60 },
  { key: 'INTERMEDIATE_II', label: 'Intermediate II', arena: 'STANDARD_20x60', qualifyScore: 60 },
  { key: 'GRAND_PRIX', label: 'Grand Prix', arena: 'STANDARD_20x60', qualifyScore: 65 },
] as const;

// ─── Discipline Labels ──────────────────────────────────────────────────

export const DISCIPLINE_LABELS = {
  DRESSAGE: 'Dressage',
  SHOW_JUMPING: 'Show Jumping',
  EVENTING: 'Eventing',
  TENT_PEGGING: 'Tent Pegging',
} as const;
