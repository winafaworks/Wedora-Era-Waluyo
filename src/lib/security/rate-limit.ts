/**
 * In-Memory Sliding Window Rate Limiter
 * Melindungi endpoint autentikasi dari serangan brute-force kamus & kredensial massal.
 */

interface RateLimitRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  blockedUntil: number | null;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5; // Maksimal percobaan salah
const WINDOW_MS = 15 * 60 * 1000; // Jendela waktu 15 menit
const BLOCK_DURATION_MS = 15 * 60 * 1000; // Diblokir selama 15 menit jika melebihi batas

// Bersihkan data lama secara berkala setiap 30 menit
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now - record.lastAttempt > WINDOW_MS && (!record.blockedUntil || now > record.blockedUntil)) {
        rateLimitStore.delete(key);
      }
    }
  }, 30 * 60 * 1000);
}

export function checkLoginRateLimit(identifier: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterMinutes?: number;
} {
  const cleanKey = identifier.trim().toLowerCase();
  const record = rateLimitStore.get(cleanKey);
  const now = Date.now();

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Jika sedang diblokir
  if (record.blockedUntil && now < record.blockedUntil) {
    const diffMs = record.blockedUntil - now;
    const retryAfterMinutes = Math.max(1, Math.ceil(diffMs / 60000));
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterMinutes,
    };
  }

  // Jika window waktu sudah lewat, reset
  if (now - record.firstAttempt > WINDOW_MS) {
    rateLimitStore.delete(cleanKey);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.count);
  return {
    allowed: record.count < MAX_ATTEMPTS,
    remainingAttempts: remaining,
  };
}

export function recordFailedLogin(identifier: string): {
  isBlocked: boolean;
  retryAfterMinutes?: number;
  remainingAttempts: number;
} {
  const cleanKey = identifier.trim().toLowerCase();
  const now = Date.now();
  const record = rateLimitStore.get(cleanKey);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    rateLimitStore.set(cleanKey, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      blockedUntil: null,
    });
    return {
      isBlocked: false,
      remainingAttempts: MAX_ATTEMPTS - 1,
    };
  }

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    const retryAfterMinutes = Math.ceil(BLOCK_DURATION_MS / 60000);
    return {
      isBlocked: true,
      retryAfterMinutes,
      remainingAttempts: 0,
    };
  }

  return {
    isBlocked: false,
    remainingAttempts: MAX_ATTEMPTS - record.count,
  };
}

export function resetLoginRateLimit(identifier: string): void {
  const cleanKey = identifier.trim().toLowerCase();
  rateLimitStore.delete(cleanKey);
}
