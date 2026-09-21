// Shared in-memory cache for course data
// Extracted to a standalone module so it can be safely imported from both
// route.ts and other route handlers without violating Next.js route-export rules.

const courseCache = new Map<string, { data: any; expiresAt: number }>();

export function getCacheEntry(key: string) {
  return courseCache.get(key);
}

export function setCacheEntry(key: string, data: any, ttlMs: number) {
  courseCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function clearCourseCache() {
  courseCache.clear();
}
