import { RetryConfig, RetryStrategy as IRetryStrategy } from '../types';

export class ExponentialBackoffRetryStrategy implements IRetryStrategy {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      retryableErrors: ['ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNREFUSED'],
      ...config
    };
  }

  shouldRetry(error: any, attempt: number): boolean {
    if (attempt >= this.config.maxRetries) {
      return false;
    }

    // HTTP status code kontrolü
    if (error.response && this.config.retryableStatusCodes.includes(error.response.status)) {
      return true;
    }

    // Network error kontrolü
    if (error.code && this.config.retryableErrors.includes(error.code)) {
      return true;
    }

    // Timeout kontrolü
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return true;
    }

    return false;
  }

  getDelay(attempt: number): number {
    return this.config.retryDelay * Math.pow(this.config.backoffMultiplier, attempt);
  }

  getConfig(): RetryConfig {
    return { ...this.config };
  }
}
