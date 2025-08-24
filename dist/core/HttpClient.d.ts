import { AxiosResponse } from 'axios';
import { CutlineConfig, Response, CutlineClient, RetryConfig } from '../types';
export declare class Cutline implements CutlineClient {
    private axiosInstance;
    private retryStrategy;
    private circuitBreaker;
    private config;
    constructor(config?: CutlineConfig);
    request<T = any>(config: CutlineConfig): Promise<Response<T>>;
    get<T = any>(url: string, config?: CutlineConfig): Promise<Response<T>>;
    post<T = any>(url: string, data?: any, config?: CutlineConfig): Promise<Response<T>>;
    put<T = any>(url: string, data?: any, config?: CutlineConfig): Promise<Response<T>>;
    delete<T = any>(url: string, config?: CutlineConfig): Promise<Response<T>>;
    patch<T = any>(url: string, data?: any, config?: CutlineConfig): Promise<Response<T>>;
    head<T = any>(url: string, config?: CutlineConfig): Promise<Response<T>>;
    options<T = any>(url: string, config?: CutlineConfig): Promise<Response<T>>;
    private executeWithRetry;
    private sleep;
    get defaults(): CutlineConfig;
    get interceptors(): {
        request: import("axios").AxiosInterceptorManager<import("axios").InternalAxiosRequestConfig>;
        response: import("axios").AxiosInterceptorManager<AxiosResponse>;
    };
    getCircuitBreakerState(): string;
    resetCircuitBreaker(): void;
    getRetryConfig(): RetryConfig;
    getUri(config?: CutlineConfig): string;
}
//# sourceMappingURL=HttpClient.d.ts.map