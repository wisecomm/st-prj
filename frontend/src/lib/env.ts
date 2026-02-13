export const env = {
  BACKEND_API_URL: process.env.BACKEND_API_URL ?? "http://localhost:8080/api",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;
