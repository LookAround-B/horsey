import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

// ─── Auth ────────────────────────────────────────────────────────────────

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

// ─── Products ────────────────────────────────────────────────────────────

export function useProducts(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => apiClient.get(ENDPOINTS.PRODUCTS_SEARCH, { params }).then((r) => r.data),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiClient.get(ENDPOINTS.PRODUCT(id)).then((r) => r.data),
    enabled: !!id,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products-featured'],
    queryFn: () => apiClient.get(ENDPOINTS.PRODUCTS_FEATURED).then((r) => r.data),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get(ENDPOINTS.PRODUCTS_CATEGORIES).then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Vendor ──────────────────────────────────────────────────────────────

export function useVendorProfile() {
  return useQuery({
    queryKey: ['vendor-me'],
    queryFn: () => apiClient.get(ENDPOINTS.VENDOR_ME).then((r) => r.data),
    retry: false,
  });
}

export function useVendorAnalytics() {
  return useQuery({
    queryKey: ['vendor-analytics'],
    queryFn: () => apiClient.get(ENDPOINTS.VENDOR_ANALYTICS).then((r) => r.data),
  });
}

export function useVendorListings(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['vendor-listings', params],
    queryFn: () => apiClient.get(ENDPOINTS.VENDOR_MY_LISTINGS, { params }).then((r) => r.data),
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post('/products', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-listings'] }),
  });
}

export function useUpdateListing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.patch(ENDPOINTS.PRODUCT(id), data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-listings'] });
      qc.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

// ─── Cart ────────────────────────────────────────────────────────────────

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => apiClient.get(ENDPOINTS.CART).then((r) => r.data),
    retry: false,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: string; variantId?: string; quantity: number }) =>
      apiClient.post(ENDPOINTS.CART_ITEMS, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => apiClient.delete(ENDPOINTS.CART_ITEM(itemId)).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

// ─── Orders (Buyer) ──────────────────────────────────────────────────────

export function useBuyerOrders(params?: { page?: number }) {
  return useQuery({
    queryKey: ['buyer-orders', params],
    queryFn: () => apiClient.get(ENDPOINTS.MY_ORDERS, { params }).then((r) => r.data),
    retry: false,
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post(ENDPOINTS.CHECKOUT, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['buyer-orders'] });
    },
  });
}

// ─── Orders (Vendor) ─────────────────────────────────────────────────────

export function useVendorOrders(params?: { page?: number }) {
  return useQuery({
    queryKey: ['vendor-orders', params],
    queryFn: () => apiClient.get(ENDPOINTS.VENDOR_ORDERS, { params }).then((r) => r.data),
  });
}

export function useAcceptOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(ENDPOINTS.SUB_ORDER_ACCEPT(id)).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-orders'] }),
  });
}

export function useDeclineOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.patch(ENDPOINTS.SUB_ORDER_DECLINE(id), { reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-orders'] }),
  });
}

export function useShipOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; trackingNumber: string; shippingMethod?: string }) =>
      apiClient.patch(ENDPOINTS.SUB_ORDER_SHIP(id), data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-orders'] }),
  });
}

// ─── Reviews ─────────────────────────────────────────────────────────────

export function useCreateReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { rating: number; body?: string; subOrderId: string }) =>
      apiClient.post(ENDPOINTS.PRODUCT_REVIEWS(productId), data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['product', productId] }),
  });
}

export function useRespondToReview() {
  return useMutation({
    mutationFn: ({ reviewId, body }: { reviewId: string; body: string }) =>
      apiClient.post(ENDPOINTS.REVIEW_RESPOND(reviewId), { body }).then((r) => r.data),
  });
}

// ─── Notifications ───────────────────────────────────────────────────────

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: ['notifications', unreadOnly],
    queryFn: () =>
      apiClient
        .get(ENDPOINTS.NOTIFICATIONS, { params: { unreadOnly } })
        .then((r) => r.data),
    refetchInterval: 30000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => apiClient.get(ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT).then((r) => r.data),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      apiClient.patch(ENDPOINTS.NOTIFICATIONS_MARK_READ, { ids }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.patch(ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}
