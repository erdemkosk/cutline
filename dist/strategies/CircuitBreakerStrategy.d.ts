import { CircuitBreakerConfig, CircuitBreakerStrategy as ICircuitBreakerStrategy } from '../types';
export declare enum CircuitState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}
export declare class DefaultCircuitBreakerStrategy implements ICircuitBreakerStrategy {
    private config;
    private state;
    private failureCount;
    private lastFailureTime;
    private lastStateChangeTime;
    constructor(config?: Partial<CircuitBreakerConfig>);
    isOpen(): boolean;
    canExecute(): boolean;
    onSuccess(): void;
    onFailure(): void;
    private updateState;
    private transitionTo;
    getState(): CircuitState;
    getFailureCount(): number;
    getConfig(): CircuitBreakerConfig;
    reset(): void;
}
//# sourceMappingURL=CircuitBreakerStrategy.d.ts.map