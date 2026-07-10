// Runs once when the server boots (Next 15, stable — no config flag needed).
// Surfaces missing env vars with actionable guidance so deploy failures are
// obvious instead of showing up later as cryptic runtime errors.

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const checks: [string, string, "error" | "warn"][] = [
    [
      "DATABASE_URL",
      "PostgreSQL is required. In Railway, add the PostgreSQL plugin (it sets DATABASE_URL automatically) or set the variable manually. The app cannot serve links until this is configured.",
      "error",
    ],
    [
      "REDIS_URL",
      "Redis is optional — caching & rate limiting will be disabled, but the app still works. Add the Redis plugin in Railway to enable it.",
      "warn",
    ],
    [
      "BETTER_AUTH_SECRET",
      "Using an insecure dev secret. Generate one with `openssl rand -base64 32` and set it for production.",
      "warn",
    ],
    [
      "NEXT_PUBLIC_APP_URL",
      "Generated short links may point at the wrong origin. Set this to your public domain (e.g. https://raillink.up.railway.app).",
      "warn",
    ],
  ];

  for (const [key, guidance, level] of checks) {
    if (!process.env[key]) {
      if (level === "error") {
        console.error(`[boot] ✗ ${key} is not set. ${guidance}`);
      } else {
        console.warn(`[boot] ! ${key} is not set. ${guidance}`);
      }
    } else {
      console.log(`[boot] ✓ ${key} present`);
    }
  }
}
