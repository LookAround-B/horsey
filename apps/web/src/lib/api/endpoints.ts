export const ENDPOINTS = {
  // Auth
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  GOOGLE_AUTH: '/auth/google',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',

  // Users
  ME: '/users/me',
  USER: (id: string) => `/users/${id}`,
  MER_RECORDS: '/users/me/mer-records',
  MER_RECORDS_DISCIPLINE: (d: string) => `/users/me/mer-records/${d}`,

  // Events
  EVENTS: '/events',
  EVENT: (id: string) => `/events/${id}`,
  PUBLISH_EVENT: (id: string) => `/events/${id}/publish`,

  // Competitions
  EVENT_COMPETITIONS: (eventId: string) => `/events/${eventId}/competitions`,
  COMPETITION: (id: string) => `/competitions/${id}`,
  COMPETITION_ENTRIES: (id: string) => `/competitions/${id}/entries`,
  COMPETITION_DRAW: (id: string) => `/competitions/${id}/draw`,
  DELETE_ENTRY: (id: string) => `/entries/${id}`,

  // Scoring
  SCORE_DRESSAGE: '/scores/dressage',
  SCORE_SHOW_JUMPING: '/scores/show-jumping',
  SCORE_TENT_PEGGING: '/scores/tent-pegging',
  UPDATE_SCORE: (id: string) => `/scores/${id}`,
  COMPETITION_SCORES: (id: string) => `/scores/competitions/${id}/scores`,
  COMPETITION_LEADERBOARD: (id: string) => `/scores/competitions/${id}/leaderboard`,

  // Horses
  HORSES: '/horses',
  HORSE: (id: string) => `/horses/${id}`,

  // Marketplace
  MARKETPLACE_HORSES: '/marketplace/horses',
  MARKETPLACE_HORSE: (id: string) => `/marketplace/horses/${id}`,
  TOGGLE_FAVORITE: (id: string) => `/marketplace/horses/${id}/favorite`,
  FAVORITES: '/marketplace/favorites',

  // Payments
  CREATE_ORDER: '/payments/create-order',
  VERIFY_PAYMENT: '/payments/verify',

  // Stables
  STABLES: '/stables',
  STABLE: (id: string) => `/stables/${id}`,
  STABLE_REVIEWS: (id: string) => `/stables/${id}/reviews`,
} as const;
