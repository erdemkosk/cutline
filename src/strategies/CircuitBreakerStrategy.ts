import { CircuitBreakerConfig, CircuitBreakerStrategy as ICircuitBreakerStrategy } from '../types';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export class DefaultCircuitBreakerStrategy implements ICircuitBreakerStrategy {
  private config: CircuitBreakerConfig;
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private lastStateChangeTime: number = Date.now();

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 60 saniye
      monitoringPeriod: 60000, // 60 saniye
      expectedErrors: [500, 502, 503, 504],
      ...config
    };
  }

  isOpen(): boolean {
    this.updateState();
    return this.state === CircuitState.OPEN;
  }

  canExecute(): boolean {
    this.updateState();
    return this.state !== CircuitState.OPEN;
  }

  onSuccess(): void {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.CLOSED);
    }
  }

  onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  private updateState(): void {
    const now = Date.now();

    if (this.state === CircuitState.OPEN) {
      if (now - this.lastStateChangeTime >= this.config.recoveryTimeout) {
        this.transitionTo(CircuitState.HALF_OPEN);
      }
    }
  }

  private transitionTo(newState: CircuitState): void {
    this.state = newState;
    this.lastStateChangeTime = Date.now();
  }

  getState(): CircuitState {
    this.updateState(); // State'i güncelle
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  getConfig(): CircuitBreakerConfig {
    return { ...this.config };
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.lastStateChangeTime = Date.now();
  }
}
