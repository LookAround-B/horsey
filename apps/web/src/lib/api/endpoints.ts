export const ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  GOOGLE_AUTH: '/auth/google',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',

  // Users
  ME: '/users/me',
  USER: (id: string) => `/users/${id}`,
  MY_ADDRESSES: '/users/me/addresses',
  MY_ADDRESS: (id: string) => `/users/me/addresses/${id}`,

  // Products & Catalog
  PRODUCTS_SEARCH: '/products/search',
  PRODUCTS_FEATURED: '/products/featured',
  PRODUCTS_CATEGORIES: '/products/categories',
  PRODUCT: (id: string) => `/products/${id}`,
  PRODUCT_MEDIA: (id: string) => `/products/${id}/media`,
  PRODUCT_REVIEWS: (id: string) => `/products/${id}/reviews`,
  REVIEW_RESPOND: (id: string) => `/products/reviews/${id}/respond`,

  // Vendor
  VENDOR_APPLY: '/vendors/apply',
  VENDOR_ME: '/vendors/me',
  VENDOR_KYC: '/vendors/me/kyc',
  VENDOR_ANALYTICS: '/vendors/me/analytics',
  VENDOR_MY_LISTINGS: '/products/vendor/my-listings',

  // Cart
  CART: '/cart',
  CART_ITEMS: '/cart/items',
  CART_ITEM: (id: string) => `/cart/items/${id}`,

  // Orders
  CHECKOUT: '/orders/checkout',
  MY_ORDERS: '/orders',
  VENDOR_ORDERS: '/vendor/orders',
  SUB_ORDER_ACCEPT: (id: string) => `/sub-orders/${id}/accept`,
  SUB_ORDER_DECLINE: (id: string) => `/sub-orders/${id}/decline`,
  SUB_ORDER_SHIP: (id: string) => `/sub-orders/${id}/ship`,
  SUB_ORDER_DELIVER: (id: string) => `/sub-orders/${id}/deliver`,

  // Admin
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_SLA_DASHBOARD: '/admin/sla-dashboard',
  ADMIN_FORCE_ACCEPT: (id: string) => `/admin/sub-orders/${id}/force-accept`,
  ADMIN_FORCE_CANCEL: (id: string) => `/admin/sub-orders/${id}/force-cancel`,
  ADMIN_VENDOR_APPLICATIONS: '/vendors/applications',
  ADMIN_VENDOR: (id: string) => `/vendors/${id}`,
  ADMIN_VENDOR_REVIEW: (id: string) => `/vendors/${id}/review`,

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',
  NOTIFICATIONS_MARK_READ: '/notifications/mark-read',
  NOTIFICATIONS_MARK_ALL_READ: '/notifications/mark-all-read',
} as const;
