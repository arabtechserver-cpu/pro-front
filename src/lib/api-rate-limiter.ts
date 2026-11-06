interface ClientRecord {
  total: number;
  heavy: number;
  resetAt: number;
}

export class ApiRateLimiter {
  private records = new Map<string, ClientRecord>();
  private readonly windowMs: number;
  private readonly maxTotal: number;
  private readonly maxHeavy: number;
  private readonly maxCapacity: number;
  private lastCleanup: number = Date.now();

  constructor(options?: {
    windowMs?: number;
    maxTotal?: number;
    maxHeavy?: number;
    maxCapacity?: number;
  }) {
    this.windowMs = options?.windowMs ?? 60000;
    this.maxTotal = options?.maxTotal ?? 120;
    this.maxHeavy = options?.maxHeavy ?? 15;
    this.maxCapacity = options?.maxCapacity ?? 10000;
  }

  public check(ip: string, isHeavy: boolean): { allowed: boolean; retryAfter: number } {
    const now = Date.now();
    this.maybeCleanup(now);

    let record = this.records.get(ip);
    if (!record || record.resetAt <= now) {
      if (!record && this.records.size >= this.maxCapacity) {
        this.cleanupExpired(now);
      }
      record = { total: 0, heavy: 0, resetAt: now + this.windowMs };
      this.records.set(ip, record);
    }

    const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

    if (isHeavy && record.heavy >= this.maxHeavy) {
      return { allowed: false, retryAfter };
    }

    if (record.total >= this.maxTotal) {
      return { allowed: false, retryAfter };
    }

    record.total++;
    if (isHeavy) record.heavy++;

    return { allowed: true, retryAfter: 0 };
  }

  private maybeCleanup(now: number) {
    if (now - this.lastCleanup > 30000) {
      this.lastCleanup = now;
      this.cleanupExpired(now);
    }
  }

  private cleanupExpired(now: number) {
    for (const [ip, record] of this.records) {
      if (record.resetAt <= now) {
        this.records.delete(ip);
      }
    }
    if (this.records.size >= this.maxCapacity) {
      const keysToDelete = Array.from(this.records.keys()).slice(0, Math.floor(this.maxCapacity * 0.2));
      for (const k of keysToDelete) {
        this.records.delete(k);
      }
    }
  }
}

export const apiRateLimiter = new ApiRateLimiter();
