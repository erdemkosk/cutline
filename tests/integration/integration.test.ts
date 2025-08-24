import { Cutline } from '../../src/index';

describe('Cutline Integration Tests', () => {
  let client: Cutline;

  beforeEach(() => {
    client = new Cutline({
      baseURL: 'https://jsonplaceholder.typicode.com',
      timeout: 10000,
      retry: {
        maxRetries: 1,
        retryDelay: 100
      },
      circuitBreaker: {
        failureThreshold: 3,
        recoveryTimeout: 5000
      }
    });
  });

  describe('Basic API Integration', () => {
    it('should make successful GET request', async () => {
      const response = await client.get('/posts/1');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('title');
    }, 15000);

    it('should make successful POST request', async () => {
      const postData = {
        title: 'Test Post',
        body: 'Test body content',
        userId: 1
      };

      const response = await client.post('/posts', postData);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
    }, 15000);
  });

  describe('Circuit Breaker Basic Test', () => {
    it('should start with CLOSED state', () => {
      expect(client.getCircuitBreakerState()).toBe('CLOSED');
    });

    it('should allow requests when CLOSED', async () => {
      const response = await client.get('/posts/1');
      expect(response.status).toBe(200);
      expect(client.getCircuitBreakerState()).toBe('CLOSED');
    }, 15000);
  });

  describe('Axios Compatibility', () => {
    it('should work with interceptors', async () => {
      let requestUrl = '';
      let responseStatus = 0;

      client.interceptors.request.use(config => {
        requestUrl = config.url || '';
        return config;
      });

      client.interceptors.response.use(response => {
        responseStatus = response.status;
        return response;
      });

      await client.get('/posts/1');
      
      expect(requestUrl).toBe('/posts/1');
      expect(responseStatus).toBe(200);
    }, 15000);

    it('should work with defaults', async () => {
      client.defaults.timeout = 5000;
      expect(client.defaults.timeout).toBe(5000);
      
      const response = await client.get('/posts/1');
      expect(response.status).toBe(200);
    }, 15000);
  });
});
