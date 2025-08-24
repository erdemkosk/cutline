import { DefaultCircuitBreakerStrategy } from '../../src/strategies/CircuitBreakerStrategy';

describe('Circuit Breaker Strategy', () => {
  let circuitBreaker: DefaultCircuitBreakerStrategy;

  beforeEach(() => {
    circuitBreaker = new DefaultCircuitBreakerStrategy({
      failureThreshold: 2,
      recoveryTimeout: 1000,
      monitoringPeriod: 2000
    });
  });

  describe('Initial State', () => {
    it('should start with CLOSED state', () => {
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });

    it('should allow execution when CLOSED', () => {
      expect(circuitBreaker.canExecute()).toBe(true);
    });
  });

  describe('State Transitions', () => {
    it('should remain CLOSED after single failure', () => {
      circuitBreaker.onFailure();
      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it('should open after reaching failure threshold', () => {
      circuitBreaker.onFailure(); // 1st failure
      circuitBreaker.onFailure(); // 2nd failure - threshold reached
      
      expect(circuitBreaker.getState()).toBe('OPEN');
      expect(circuitBreaker.canExecute()).toBe(false);
    });

    it('should transition to HALF_OPEN after recovery timeout', async () => {
      // Open circuit breaker
      circuitBreaker.onFailure();
      circuitBreaker.onFailure();
      expect(circuitBreaker.getState()).toBe('OPEN');

      // Wait for recovery timeout
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(circuitBreaker.getState()).toBe('HALF_OPEN');
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it('should close after successful request in HALF_OPEN', async () => {
      // Open circuit breaker
      circuitBreaker.onFailure();
      circuitBreaker.onFailure();
      
      // Wait for recovery timeout
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(circuitBreaker.getState()).toBe('HALF_OPEN');

      // Success in HALF_OPEN
      circuitBreaker.onSuccess();
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });

    it('should open again after failure in HALF_OPEN', async () => {
      // Open circuit breaker
      circuitBreaker.onFailure();
      circuitBreaker.onFailure();
      
      // Wait for recovery timeout
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(circuitBreaker.getState()).toBe('HALF_OPEN');

      // Failure in HALF_OPEN
      circuitBreaker.onFailure();
      expect(circuitBreaker.getState()).toBe('OPEN');
    });
  });

  describe('Success Handling', () => {
    it('should reset failure count on success', () => {
      circuitBreaker.onFailure(); // 1st failure
      circuitBreaker.onSuccess(); // Success resets count
      
      expect(circuitBreaker.getState()).toBe('CLOSED');
      
      // Should need 2 more failures to open
      circuitBreaker.onFailure();
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });

    it('should maintain CLOSED state on consecutive successes', () => {
      circuitBreaker.onSuccess();
      circuitBreaker.onSuccess();
      circuitBreaker.onSuccess();
      
      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.canExecute()).toBe(true);
    });
  });

  describe('Manual Reset', () => {
    it('should reset to CLOSED state', () => {
      // Open circuit breaker
      circuitBreaker.onFailure();
      circuitBreaker.onFailure();
      expect(circuitBreaker.getState()).toBe('OPEN');

      // Manual reset
      circuitBreaker.reset();
      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it('should reset failure count', () => {
      circuitBreaker.onFailure(); // 1st failure
      circuitBreaker.reset();
      
      // Should need 2 failures again to open
      circuitBreaker.onFailure();
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });
  });

  describe('Configuration', () => {
    it('should use custom failure threshold', () => {
      const customBreaker = new DefaultCircuitBreakerStrategy({
        failureThreshold: 5
      });

      // 4 failures should not open
      for (let i = 0; i < 4; i++) {
        customBreaker.onFailure();
      }
      expect(customBreaker.getState()).toBe('CLOSED');

      // 5th failure should open
      customBreaker.onFailure();
      expect(customBreaker.getState()).toBe('OPEN');
    });

    it('should use custom recovery timeout', async () => {
      const customBreaker = new DefaultCircuitBreakerStrategy({
        failureThreshold: 1,
        recoveryTimeout: 500 // 500ms
      });

      // Open circuit breaker
      customBreaker.onFailure();
      expect(customBreaker.getState()).toBe('OPEN');

      // Wait less than timeout
      await new Promise(resolve => setTimeout(resolve, 300));
      expect(customBreaker.getState()).toBe('OPEN');

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 300));
      expect(customBreaker.getState()).toBe('HALF_OPEN');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid state changes', () => {
      // Rapid failures
      for (let i = 0; i < 10; i++) {
        circuitBreaker.onFailure();
      }
      
      expect(circuitBreaker.getState()).toBe('OPEN');
      expect(circuitBreaker.canExecute()).toBe(false);
    });

    it('should handle rapid success/failure alternation', () => {
      circuitBreaker.onFailure();
      circuitBreaker.onSuccess();
      circuitBreaker.onFailure();
      circuitBreaker.onSuccess();
      
      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.canExecute()).toBe(true);
    });
  });
});
