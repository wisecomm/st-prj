function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Set it in .env or deployment config.`
    );
  }
  return value;
}

const isDev = process.env.NODE_ENV === "development";

export const env = {
  BACKEND_API_URL: requireEnv(
    "BACKEND_API_URL",
    isDev ? "http://localhost:8080/api" : undefined
  ),
  NEXTAUTH_URL: requireEnv(
    "NEXTAUTH_URL",
    isDev ? "http://localhost:3000" : undefined
  ),
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;
