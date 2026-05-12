export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_ACCEPTANCE: 'Pending Vendor Acceptance',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  AUTO_CANCELLED: 'Auto-Cancelled',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  REFUNDED: 'Refunded',
};

export const DECLINE_REASONS = [
  'Out of stock',
  'Cannot fulfil in time',
  'Buyer did not meet requirements',
  'Other',
] as const;

export type DeclineReason = (typeof DECLINE_REASONS)[number];
