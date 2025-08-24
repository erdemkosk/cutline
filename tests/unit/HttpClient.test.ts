import { Cutline } from '../../src/index';

describe('Cutline HttpClient', () => {
  let client: Cutline;

  beforeEach(() => {
    client = new Cutline({
      baseURL: 'https://test.example.com',
      timeout: 5000
    });
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      const defaultClient = new Cutline();
      expect(defaultClient).toBeInstanceOf(Cutline);
    });

    it('should create instance with custom config', () => {
      const customClient = new Cutline({
        baseURL: 'https://custom.example.com',
        timeout: 10000,
        retry: { maxRetries: 5 },
        circuitBreaker: { failureThreshold: 3 }
      });
      expect(customClient).toBeInstanceOf(Cutline);
    });
  });

  describe('Circuit Breaker', () => {
    it('should start with CLOSED state', () => {
      expect(client.getCircuitBreakerState()).toBe('CLOSED');
    });

    it('should reset circuit breaker', () => {
      client.resetCircuitBreaker();
      expect(client.getCircuitBreakerState()).toBe('CLOSED');
    });
  });

  describe('Retry Configuration', () => {
    it('should return retry config', () => {
      const config = client.getRetryConfig();
      expect(config).toHaveProperty('maxRetries');
      expect(config).toHaveProperty('retryDelay');
      expect(config).toHaveProperty('backoffMultiplier');
    });

    it('should have default retry values', () => {
      const config = client.getRetryConfig();
      expect(config.maxRetries).toBe(3);
      expect(config.retryDelay).toBe(1000);
      expect(config.backoffMultiplier).toBe(2);
    });
  });

  describe('Axios Compatibility', () => {
    it('should have interceptors', () => {
      expect(client.interceptors).toBeDefined();
      expect(client.interceptors.request).toBeDefined();
      expect(client.interceptors.response).toBeDefined();
    });

    it('should have defaults', () => {
      expect(client.defaults).toBeDefined();
      expect(client.defaults.baseURL).toBe('https://test.example.com');
      expect(client.defaults.timeout).toBe(5000);
    });

    it('should have getUri method', () => {
      expect(typeof client.getUri).toBe('function');
    });
  });
});
