import { AxiosRequestConfig, AxiosResponse } from 'axios';

// Axios config'ini extend ediyoruz
export interface CutlineConfig extends AxiosRequestConfig {
  retry?: Partial<RetryConfig>;
  circuitBreaker?: Partial<CircuitBreakerConfig>;
}

export interface Response<T = any> extends AxiosResponse<T> {
  // Axios response'unu extend ediyoruz
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
  retryableErrors: string[];
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  expectedErrors: number[];
}

export interface RetryStrategy {
  shouldRetry(error: any, attempt: number): boolean;
  getDelay(attempt: number): number;
}

export interface CircuitBreakerStrategy {
  isOpen(): boolean;
  onSuccess(): void;
  onFailure(): void;
  canExecute(): boolean;
}

// Cutline client interface - Axios'un tüm method'larını destekler
export interface CutlineClient {
  // Axios'un tüm method'ları
  request<T = any>(config: CutlineConfig): Promise<Response<T>>;
  get<T = any>(url: string, config?: CutlineConfig): Promise<Response<T>>;
  post<T = any>(url: string, data?: any, config?: CutlineConfig): Promise<Response<T>>;
  put<T = any>(url: string, data?: any, config?: CutlineConfig): Promise<Response<T>>;
  delete<T = any>(url: string, config?: CutlineConfig): Promise<Response<T>>;
  patch<T = any>(url: string, data?: any, config?: CutlineConfig): Promise<Response<T>>;
  head<T = any>(url: string, config?: CutlineConfig): Promise<Response<T>>;
  options<T = any>(url: string, config?: CutlineConfig): Promise<Response<T>>;
  
  // Axios'un diğer özellikleri
  defaults: CutlineConfig;
  interceptors: {
    request: any;
    response: any;
  };
  
  // Bizim eklediğimiz özellikler
  getCircuitBreakerState(): string;
  resetCircuitBreaker(): void;
  getRetryConfig(): RetryConfig;
}
