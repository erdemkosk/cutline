import { RetryConfig, RetryStrategy as IRetryStrategy } from '../types';
export declare class ExponentialBackoffRetryStrategy implements IRetryStrategy {
    private config;
    constructor(config?: Partial<RetryConfig>);
    shouldRetry(error: any, attempt: number): boolean;
    getDelay(attempt: number): number;
    getConfig(): RetryConfig;
}
//# sourceMappingURL=RetryStrategy.d.ts.map