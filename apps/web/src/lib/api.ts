// In the browser, route through Next.js /api/proxy to avoid mixed-content (HTTP vs HTTPS).
// On the server (SSR/build), call the real API URL directly.
export const API_BASE =
  typeof window !== "undefined"
    ? "/api/proxy"
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1");
