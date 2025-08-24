"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cutline = void 0;
const axios_1 = __importDefault(require("axios"));
const RetryStrategy_1 = require("../strategies/RetryStrategy");
const CircuitBreakerStrategy_1 = require("../strategies/CircuitBreakerStrategy");
class Cutline {
    constructor(config = {}) {
        this.config = config;
        // Axios instance oluştur - tüm Axios config'leri geçerli
        this.axiosInstance = axios_1.default.create(config);
        // Retry stratejisi
        this.retryStrategy = new RetryStrategy_1.ExponentialBackoffRetryStrategy(config.retry);
        // Circuit breaker stratejisi
        this.circuitBreaker = new CircuitBreakerStrategy_1.DefaultCircuitBreakerStrategy(config.circuitBreaker);
        // Request interceptor - circuit breaker kontrolü
        this.axiosInstance.interceptors.request.use((config) => {
            if (!this.circuitBreaker.canExecute()) {
                throw new Error('Circuit breaker is open');
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        // Response interceptor - circuit breaker durumu güncelleme
        this.axiosInstance.interceptors.response.use((response) => {
            this.circuitBreaker.onSuccess();
            return response;
        }, (error) => {
            this.circuitBreaker.onFailure();
            return Promise.reject(error);
        });
    }
    // Axios'un tüm method'larını destekle
    async request(config) {
        return this.executeWithRetry(() => this.axiosInstance.request(config));
    }
    async get(url, config) {
        return this.executeWithRetry(() => this.axiosInstance.get(url, config));
    }
    async post(url, data, config) {
        return this.executeWithRetry(() => this.axiosInstance.post(url, data, config));
    }
    async put(url, data, config) {
        return this.executeWithRetry(() => this.axiosInstance.put(url, data, config));
    }
    async delete(url, config) {
        return this.executeWithRetry(() => this.axiosInstance.delete(url, config));
    }
    async patch(url, data, config) {
        return this.executeWithRetry(() => this.axiosInstance.patch(url, data, config));
    }
    async head(url, config) {
        return this.executeWithRetry(() => this.axiosInstance.head(url, config));
    }
    async options(url, config) {
        return this.executeWithRetry(() => this.axiosInstance.options(url, config));
    }
    // Retry mekanizması
    async executeWithRetry(requestFn) {
        let lastError;
        for (let attempt = 0; attempt <= this.retryStrategy.getConfig().maxRetries; attempt++) {
            try {
                const response = await requestFn();
                return response;
            }
            catch (error) {
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
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Axios'un diğer özelliklerini expose et
    get defaults() {
        return this.axiosInstance.defaults;
    }
    get interceptors() {
        return this.axiosInstance.interceptors;
    }
    // Bizim eklediğimiz özellikler
    getCircuitBreakerState() {
        return this.circuitBreaker.getState();
    }
    resetCircuitBreaker() {
        this.circuitBreaker.reset();
    }
    getRetryConfig() {
        return this.retryStrategy.getConfig();
    }
    // Axios'un diğer utility method'ları
    getUri(config) {
        return this.axiosInstance.getUri(config);
    }
}
exports.Cutline = Cutline;
//# sourceMappingURL=HttpClient.js.map