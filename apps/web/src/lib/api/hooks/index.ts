import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

// ─── Events ─────────────────────────────────────────────────────────────

export function useEvents(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => apiClient.get(ENDPOINTS.EVENTS, { params }).then((r) => r.data.data),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => apiClient.get(ENDPOINTS.EVENT(id)).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post(ENDPOINTS.EVENTS, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useUpdateEvent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.patch(ENDPOINTS.EVENT(id), data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event', id] });
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function usePublishEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(ENDPOINTS.PUBLISH_EVENT(id)).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

// ─── Competitions ───────────────────────────────────────────────────────

export function useCompetitions(eventId: string) {
  return useQuery({
    queryKey: ['competitions', eventId],
    queryFn: () => apiClient.get(ENDPOINTS.EVENT_COMPETITIONS(eventId)).then((r) => r.data.data),
    enabled: !!eventId,
  });
}

export function useCompetition(id: string) {
  return useQuery({
    queryKey: ['competition', id],
    queryFn: () => apiClient.get(ENDPOINTS.COMPETITION(id)).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateCompetition(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.post(ENDPOINTS.EVENT_COMPETITIONS(eventId), data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['competitions', eventId] }),
  });
}

export function useCreateEntry(competitionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { horseId: string }) =>
      apiClient.post(ENDPOINTS.COMPETITION_ENTRIES(competitionId), data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['competition', competitionId] }),
  });
}

export function useEntries(competitionId: string) {
  return useQuery({
    queryKey: ['entries', competitionId],
    queryFn: () => apiClient.get(ENDPOINTS.COMPETITION_ENTRIES(competitionId)).then((r) => r.data.data),
    enabled: !!competitionId,
  });
}

export function useGenerateDraw(competitionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(ENDPOINTS.COMPETITION_DRAW(competitionId)).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['competition', competitionId] }),
  });
}

// ─── Scoring ────────────────────────────────────────────────────────────

export function useSubmitDressageScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post(ENDPOINTS.SCORE_DRESSAGE, data).then((r) => r.data.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['leaderboard', vars.competitionId] });
      qc.invalidateQueries({ queryKey: ['scores', vars.competitionId] });
    },
  });
}

export function useSubmitShowJumpingScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post(ENDPOINTS.SCORE_SHOW_JUMPING, data).then((r) => r.data.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['leaderboard', vars.competitionId] });
    },
  });
}

export function useSubmitTentPeggingScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post(ENDPOINTS.SCORE_TENT_PEGGING, data).then((r) => r.data.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['leaderboard', vars.competitionId] });
    },
  });
}

export function useLeaderboard(competitionId: string) {
  return useQuery({
    queryKey: ['leaderboard', competitionId],
    queryFn: () => apiClient.get(ENDPOINTS.COMPETITION_LEADERBOARD(competitionId)).then((r) => r.data.data),
    enabled: !!competitionId,
    refetchInterval: 5000, // Poll every 5s (supplement Pusher)
  });
}

export function useScores(competitionId: string) {
  return useQuery({
    queryKey: ['scores', competitionId],
    queryFn: () => apiClient.get(ENDPOINTS.COMPETITION_SCORES(competitionId)).then((r) => r.data.data),
    enabled: !!competitionId,
  });
}

// ─── Horses ─────────────────────────────────────────────────────────────

export function useMyHorses() {
  return useQuery({
    queryKey: ['my-horses'],
    queryFn: () => apiClient.get(ENDPOINTS.HORSES).then((r) => r.data.data),
  });
}

export function useHorse(id: string) {
  return useQuery({
    queryKey: ['horse', id],
    queryFn: () => apiClient.get(ENDPOINTS.HORSE(id)).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateHorse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post(ENDPOINTS.HORSES, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-horses'] }),
  });
}

// ─── Marketplace ────────────────────────────────────────────────────────

export function useMarketplaceHorses(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['marketplace', params],
    queryFn: () => apiClient.get(ENDPOINTS.MARKETPLACE_HORSES, { params }).then((r) => r.data.data),
  });
}

export function useMarketplaceHorse(id: string) {
  return useQuery({
    queryKey: ['marketplace-horse', id],
    queryFn: () => apiClient.get(ENDPOINTS.MARKETPLACE_HORSE(id)).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (horseId: string) => apiClient.post(ENDPOINTS.TOGGLE_FAVORITE(horseId)).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketplace'] }),
  });
}

// ─── Users ──────────────────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get(ENDPOINTS.ME).then((r) => r.data.data),
    retry: false,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.patch(ENDPOINTS.ME, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useMerRecords(discipline?: string) {
  return useQuery({
    queryKey: ['mer-records', discipline],
    queryFn: () => {
      const url = discipline ? ENDPOINTS.MER_RECORDS_DISCIPLINE(discipline) : ENDPOINTS.MER_RECORDS;
      return apiClient.get(url).then((r) => r.data.data);
    },
  });
}

// ─── Stables ────────────────────────────────────────────────────────────

export function useStables(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['stables', params],
    queryFn: () => apiClient.get(ENDPOINTS.STABLES, { params }).then((r) => r.data.data),
  });
}

export function useStable(id: string) {
  return useQuery({
    queryKey: ['stable', id],
    queryFn: () => apiClient.get(ENDPOINTS.STABLE(id)).then((r) => r.data.data),
    enabled: !!id,
  });
}

// ─── Payments ───────────────────────────────────────────────────────────

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: (data: { amount: number; entryIds: string[] }) =>
      apiClient.post(ENDPOINTS.CREATE_ORDER, data).then((r) => r.data.data),
  });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
      apiClient.post(ENDPOINTS.VERIFY_PAYMENT, data).then((r) => r.data.data),
  });
}
