/**
 * Type declarations for @upstash/redis
 *
 * Minimal type stubs for the Upstash Redis REST client.
 * These will be superseded by the actual package types once
 * @upstash/redis is installed via npm.
 */
declare module '@upstash/redis' {
  export interface RedisOptions {
    url: string;
    token: string;
  }

  export interface SetOptions {
    /** Set TTL in milliseconds */
    px?: number;
    /** Set TTL in seconds */
    ex?: number;
  }

  export interface ScanOptions {
    match?: string;
    count?: number;
  }

  export class Redis {
    constructor(options: RedisOptions);

    get<T = unknown>(key: string): Promise<T | null>;
    set<T = unknown>(key: string, value: T, options?: SetOptions): Promise<string>;
    del(...keys: string[]): Promise<number>;
    scan(cursor: number, options?: ScanOptions): Promise<[number, string[]]>;
  }
}
