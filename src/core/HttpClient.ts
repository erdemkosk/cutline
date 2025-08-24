import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  CutlineConfig, 
  Response, 
  CutlineClient,
  RetryConfig,
  CircuitBreakerConfig
} from '../types';
import { ExponentialBackoffRetryStrategy } from '../strategies/RetryStrategy';
import { DefaultCircuitBreakerStrategy } from '../strategies/CircuitBreakerStrategy';

export class Cutline implements CutlineClient {
  private axiosInstance: AxiosInstance;
  private retryStrategy: ExponentialBackoffRetryStrategy;
  private circuitBreaker: DefaultCircuitBreakerStrategy;
  private config: CutlineConfig;

  constructor(config: CutlineConfig = {}) {
    this.config = config;
    
    // Axios instance oluştur - tüm Axios config'leri geçerli
    this.axiosInstance = axios.create(config);

    // Retry stratejisi
    this.retryStrategy = new ExponentialBackoffRetryStrategy(config.retry);

    // Circuit breaker stratejisi
    this.circuitBreaker = new DefaultCircuitBreakerStrategy(config.circuitBreaker);

    // Request interceptor - circuit breaker kontrolü
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (!this.circuitBreaker.canExecute()) {
          throw new Error('Circuit breaker is open');
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - circuit breaker durumu güncelleme
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.circuitBreaker.onSuccess();
        return response;
      },
      (error) => {
        this.circuitBreaker.onFailure();
        return Promise.reject(error);
      }
    );
  }

  // Axios'un tüm method'larını destekle
  async request<T = any>(config: CutlineConfig): Promise<Response<T>> {
    return this.executeWithRetry<T>(() => this.axiosInstance.request(config));
  }

  async get<T = any>(url: string, config?: CutlineConfig): Promise<Response<T>> {
    return this.executeWithRetry<T>(() => this.axiosInstance.get(url, config));
  }

  async post<T = any>(url: string, data?: any, config?: CutlineConfig): Promise<Response<T>> {
    return this.executeWithRetry<T>(() => this.axiosInstance.post(url, data, config));
  }

  async put<T = any>(url: string, data?: any, config?: CutlineConfig): Promise<Response<T>> {
    return this.executeWithRetry<T>(() => this.axiosInstance.put(url, data, config));
  }

  async delete<T = any>(url: string, config?: CutlineConfig): Promise<Response<T>> {
    return this.executeWithRetry<T>(() => this.axiosInstance.delete(url, config));
  }

  async patch<T = any>(url: string, data?: any, config?: CutlineConfig): Promise<Response<T>> {
    return this.executeWithRetry<T>(() => this.axiosInstance.patch(url, data, config));
  }

  async head<T = any>(url: string, config?: CutlineConfig): Promise<Response<T>> {
    return this.executeWithRetry<T>(() => this.axiosInstance.head(url, config));
  }

  async options<T = any>(url: string, config?: CutlineConfig): Promise<Response<T>> {
    return this.executeWithRetry<T>(() => this.axiosInstance.options(url, config));
  }

  // Retry mekanizması
  private async executeWithRetry<T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<Response<T>> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= this.retryStrategy.getConfig().maxRetries; attempt++) {
      try {
        const response = await requestFn();
        return response as Response<T>;
      } catch (error: any) {
        lastError = error;
        
        if (!this.retryStrategy.shouldRetry(error, attempt)) {
          break;
        }

        if (attempt < this.retryStrategy.getConfig().maxRetries) {
          const delay = this.retryStrategy.getDelay(attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Axios'un diğer özelliklerini expose et
  get defaults(): CutlineConfig {
    return this.axiosInstance.defaults as CutlineConfig;
  }

  get interceptors() {
    return this.axiosInstance.interceptors;
  }

  // Bizim eklediğimiz özellikler
  getCircuitBreakerState(): string {
    return this.circuitBreaker.getState();
  }

  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  getRetryConfig(): RetryConfig {
    return this.retryStrategy.getConfig();
  }

  // Axios'un diğer utility method'ları
  getUri(config?: CutlineConfig): string {
    return this.axiosInstance.getUri(config);
  }
}
