"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpUtils = void 0;
class HttpUtils {
    /**
     * URL'yi base URL ile birleştir
     */
    static buildUrl(baseURL, url) {
        if (!baseURL)
            return url;
        const base = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${base}${path}`;
    }
    /**
     * Query parametrelerini URL'ye ekle
     */
    static addQueryParams(url, params) {
        if (!params || Object.keys(params).length === 0) {
            return url;
        }
        const urlObj = new URL(url, 'http://localhost');
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                urlObj.searchParams.append(key, String(value));
            }
        });
        return urlObj.pathname + urlObj.search;
    }
    /**
     * Response'u standart formata dönüştür
     */
    static normalizeResponse(axiosResponse) {
        return {
            data: axiosResponse.data,
            status: axiosResponse.status,
            statusText: axiosResponse.statusText,
            headers: axiosResponse.headers || {},
            config: axiosResponse.config
        };
    }
    /**
     * Request config'i doğrula
     */
    static validateRequestConfig(config) {
        if (!config.url) {
            throw new Error('URL is required');
        }
        if (!config.method) {
            throw new Error('HTTP method is required');
        }
        const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
        if (!validMethods.includes(config.method)) {
            throw new Error(`Invalid HTTP method: ${config.method}`);
        }
    }
    /**
     * Timeout değerini milisaniye cinsinden döndür
     */
    static parseTimeout(timeout) {
        if (typeof timeout === 'string') {
            const match = timeout.match(/^(\d+)(ms|s|m|h)$/);
            if (match) {
                const value = parseInt(match[1]);
                const unit = match[2];
                switch (unit) {
                    case 'ms': return value;
                    case 's': return value * 1000;
                    case 'm': return value * 60 * 1000;
                    case 'h': return value * 60 * 60 * 1000;
                }
            }
        }
        return typeof timeout === 'number' ? timeout : undefined;
    }
    /**
     * Headers'ı normalize et
     */
    static normalizeHeaders(headers = {}) {
        const normalized = {};
        Object.entries(headers).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                normalized[key.toLowerCase()] = String(value);
            }
        });
        return normalized;
    }
    /**
     * Error'u analiz et ve retry edilebilir olup olmadığını belirle
     */
    static isRetryableError(error) {
        // Network errors
        if (error.code && ['ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNREFUSED'].includes(error.code)) {
            return true;
        }
        // HTTP status codes
        if (error.response && [408, 429, 500, 502, 503, 504].includes(error.response.status)) {
            return true;
        }
        // Timeout errors
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return true;
        }
        return false;
    }
    /**
     * Exponential backoff delay hesapla
     */
    static calculateBackoffDelay(attempt, baseDelay, multiplier) {
        return baseDelay * Math.pow(multiplier, attempt);
    }
    /**
     * Jitter ekle (random delay variation)
     */
    static addJitter(delay, jitterFactor = 0.1) {
        const jitter = delay * jitterFactor * Math.random();
        return delay + jitter;
    }
}
exports.HttpUtils = HttpUtils;
//# sourceMappingURL=HttpUtils.js.map