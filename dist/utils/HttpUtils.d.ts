import { CutlineConfig, Response } from '../types';
export declare class HttpUtils {
    /**
     * URL'yi base URL ile birleştir
     */
    static buildUrl(baseURL: string | undefined, url: string): string;
    /**
     * Query parametrelerini URL'ye ekle
     */
    static addQueryParams(url: string, params: Record<string, any>): string;
    /**
     * Response'u standart formata dönüştür
     */
    static normalizeResponse<T>(axiosResponse: any): Response<T>;
    /**
     * Request config'i doğrula
     */
    static validateRequestConfig(config: CutlineConfig): void;
    /**
     * Timeout değerini milisaniye cinsinden döndür
     */
    static parseTimeout(timeout: string | number | undefined): number | undefined;
    /**
     * Headers'ı normalize et
     */
    static normalizeHeaders(headers?: Record<string, any>): Record<string, string>;
    /**
     * Error'u analiz et ve retry edilebilir olup olmadığını belirle
     */
    static isRetryableError(error: any): boolean;
    /**
     * Exponential backoff delay hesapla
     */
    static calculateBackoffDelay(attempt: number, baseDelay: number, multiplier: number): number;
    /**
     * Jitter ekle (random delay variation)
     */
    static addJitter(delay: number, jitterFactor?: number): number;
}
//# sourceMappingURL=HttpUtils.d.ts.map