// ─── Scoring Types ──────────────────────────────────────────────────────

export interface DressageMovement {
  number: number;
  description: string;
  letter: string;
  coefficient: 1 | 2;
  maxMark: 10;
}

export interface DressageCollectiveMark {
  name: string;
  coefficient: 1 | 2;
  maxMark: 10;
}

export interface DressageMovementScore {
  movementNumber: number;
  mark: number; // 0-10 in 0.5 increments
  coefficient: 1 | 2;
  points: number; // mark × coefficient
  remark?: string;
}

export interface DressageCollectiveScore {
  name: string;
  mark: number;
  coefficient: 1 | 2;
  points: number;
}

export interface DressageQualityMarks {
  position: number;  // Rider's position and seat (0-10)
  aids: number;      // Effectiveness of aids (0-10)
  precision: number; // Precision (0-10)
  impression: number; // General impression (0-10)
}

export interface DressageScoreInput {
  entryId: string;
  competitionId: string;
  judgeId: string;
  judgePosition?: string;
  movementMarks: DressageMovementScore[];
  collectiveMarks: DressageCollectiveScore[];
  qualityMarks?: DressageQualityMarks; // Children categories only
  errorCount: number;
}

export interface DressageScoreResult {
  rawScore: number;
  maxPossible: number;
  percentage: number;
  technicalScore?: number;
  qualityScore?: number;
  errorDeductions: number;
  finalPercentage: number;
  eventingPenalties: number;
  achievedMer: boolean;
  isEliminated: boolean;
  eliminationReason?: string;
}

// ─── Show Jumping Types ─────────────────────────────────────────────────

export interface ShowJumpingScoreInput {
  entryId: string;
  competitionId: string;
  judgeId: string;
  faults: number;         // knockdown faults (multiples of 4)
  refusals: number;       // 0, 1, 2 (3 = elimination)
  roundTime: number;      // seconds
  timeAllowed: number;    // seconds
  jumpOffFaults?: number;
  jumpOffTime?: number;
}

export interface ShowJumpingScoreResult {
  totalFaults: number;
  timeFaults: number;
  refusalFaults: number;
  knockdownFaults: number;
  roundTime: number;
  jumpOffFaults?: number;
  jumpOffTime?: number;
  isEliminated: boolean;
  eliminationReason?: string;
  achievedMer: boolean;
}

// ─── Tent Pegging Types ─────────────────────────────────────────────────

export interface TentPeggingRun {
  runNumber: number;
  pegSize: 4 | 6;    // cm
  points: number;
  carried: boolean;
}

export interface TentPeggingScoreInput {
  entryId: string;
  competitionId: string;
  judgeId: string;
  lanceRuns: TentPeggingRun[];
  swordRuns: TentPeggingRun[];
}

export interface TentPeggingScoreResult {
  totalPoints: number;
  lancePoints: number;
  swordPoints: number;
  achievedMer: boolean;
  isEliminated: boolean;
}

// ─── Leaderboard Types ──────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  entryId: string;
  riderName: string;
  horseName: string;
  drawNumber?: number;
  scores: {
    judgePosition: string;
    percentage?: number;
    faults?: number;
    points?: number;
  }[];
  finalScore: number;
  percentage?: number;
  totalFaults?: number;
  totalPoints?: number;
  penalties?: number;
  isEliminated: boolean;
  achievedMer: boolean;
}

// ─── Event Types ────────────────────────────────────────────────────────

export interface EventFilters {
  discipline?: string;
  startDate?: string;
  endDate?: string;
  city?: string;
  state?: string;
  level?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  efiSanctioned?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── User Types ─────────────────────────────────────────────────────────

export type UserRole = 'RIDER' | 'ORGANIZER' | 'JUDGE' | 'STABLE_OWNER' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  dateOfBirth?: string;
  efiLicenseNo?: string;
  feiId?: string;
  regionalZone?: string;
  bio?: string;
  isVerified: boolean;
}

// ─── Auth Types ─────────────────────────────────────────────────────────

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
