# Cutline API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Basic Usage](#basic-usage)
4. [Configuration](#configuration)
5. [API Reference](#api-reference)
6. [Examples](#examples)
7. [Migration Guide](#migration-guide)
8. [Best Practices](#best-practices)

## Overview

Cutline is a powerful **Axios wrapper** that adds automatic retry mechanism and circuit breaker functionality. It's **100% Axios compatible** - just add retry and circuit breaker features to your existing Axios setup!

### Key Features

- **🔄 Automatic Retry**: Exponential backoff with configurable retry logic
- **⚡ Circuit Breaker**: Smart error handling to protect service health
- **🔄 100% Axios Compatible**: All Axios features work exactly the same
- **📦 Zero Breaking Changes**: Drop-in replacement for Axios
- **🛡️ TypeScript Support**: Full type safety with Axios types

## Installation

```bash
npm install cutline
```

## Basic Usage

### Replace Axios with Cutline

```typescript
// Before: Using Axios
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000
});

// After: Using Cutline (same API!)
import { Cutline } from 'cutline';

const client = new Cutline({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  // Just add these two features:
  retry: { maxRetries: 3 },
  circuitBreaker: { failureThreshold: 5 }
});
```

### All Axios Features Work

```typescript
// ✅ All Axios methods work exactly the same
const response = await client.get('/users', {
  params: { page: 1 },
  headers: { 'Authorization': 'Bearer token' },
  timeout: 5000
});

// ✅ All Axios features work
client.interceptors.request.use(config => {
  console.log('Request:', config.url);
  return config;
});

// ✅ Axios defaults work
client.defaults.timeout = 15000;
```

## Configuration

### CutlineConfig

The `CutlineConfig` interface extends `AxiosRequestConfig` with additional retry and circuit breaker options:

```typescript
interface CutlineConfig extends AxiosRequestConfig {
  retry?: Partial<RetryConfig>;
  circuitBreaker?: Partial<CircuitBreakerConfig>;
}
```

### Retry Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `maxRetries` | 3 | Maximum number of retry attempts |
| `retryDelay` | 1000 | Initial retry delay (ms) |
| `backoffMultiplier` | 2 | Delay multiplier |
| `retryableStatusCodes` | [408, 429, 500, 502, 503, 504] | HTTP status codes to retry |
| `retryableErrors` | ['ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNREFUSED'] | Network errors to retry |

### Circuit Breaker Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `failureThreshold` | 5 | Number of failures to open circuit breaker |
| `recoveryTimeout` | 60000 | Recovery timeout (ms) |
| `monitoringPeriod` | 60000 | Monitoring period (ms) |
| `expectedErrors` | [500, 502, 503, 504] | Expected error codes |

## API Reference

### Constructor

```typescript
new Cutline(config?: CutlineConfig)
```

Creates a new Cutline instance with the specified configuration.

### Methods

#### HTTP Methods

All Axios HTTP methods are available:

```typescript
// GET
get<T>(url: string, config?: CutlineConfig): Promise<Response<T>>

// POST
post<T>(url: string, data?: any, config?: CutlineConfig): Promise<Response<T>>

// PUT
put<T>(url: string, data?: any, config?: CutlineConfig): Promise<Response<T>>

// DELETE
delete<T>(url: string, config?: CutlineConfig): Promise<Response<T>>

// PATCH
patch<T>(url: string, data?: any, config?: CutlineConfig): Promise<Response<T>>

// HEAD
head<T>(url: string, config?: CutlineConfig): Promise<Response<T>>

// OPTIONS
options<T>(url: string, config?: CutlineConfig): Promise<Response<T>>

// Generic request
request<T>(config: CutlineConfig): Promise<Response<T>>
```

#### Circuit Breaker Methods

```typescript
// Get current circuit breaker state
getCircuitBreakerState(): string

// Reset circuit breaker to CLOSED state
resetCircuitBreaker(): void

// Get retry configuration
getRetryConfig(): RetryConfig
```

#### Axios Properties

```typescript
// Access Axios defaults
client.defaults

// Access Axios interceptors
client.interceptors

// Generate URI
client.getUri(config?: CutlineConfig): string
```

### Circuit Breaker States

- **CLOSED**: Normal operation state
- **OPEN**: Too many failures, requests are rejected
- **HALF_OPEN**: In recovery process, limited requests accepted

### Response Type

The `Response<T>` type extends `AxiosResponse<T>`:

```typescript
interface Response<T = any> extends AxiosResponse<T> {
  // All Axios response properties are available
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
}
```

## Examples

### Basic Setup

```typescript
import { Cutline } from 'cutline';

const client = new Cutline({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  retry: {
    maxRetries: 3,
    retryDelay: 1000
  },
  circuitBreaker: {
    failureThreshold: 5,
    recoveryTimeout: 30000
  }
});
```

### Advanced Configuration

```typescript
const client = new Cutline({
  baseURL: 'https://api.example.com',
  timeout: 15000,
  headers: {
    'Authorization': 'Bearer your-token',
    'Content-Type': 'application/json'
  },
  retry: {
    maxRetries: 5,
    retryDelay: 500,
    backoffMultiplier: 1.5,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524],
    retryableErrors: ['ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNREFUSED', 'ECONNABORTED']
  },
  circuitBreaker: {
    failureThreshold: 3,
    recoveryTimeout: 15000,
    monitoringPeriod: 30000,
    expectedErrors: [500, 502, 503, 504, 520, 521, 522, 523, 524]
  }
});
```

### Error Handling

```typescript
try {
  const response = await client.get('/users');
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.log('Server error:', error.response.status, error.response.data);
  } else if (error.request) {
    // Request was made but no response
    console.log('Network error:', error.request);
  } else {
    // Something else happened
    console.log('Other error:', error.message);
  }
}
```

## Migration Guide

### Step 1: Install Cutline

```bash
npm install cutline
```

### Step 2: Replace Import

```typescript
// Before
import axios from 'axios';

// After
import { Cutline } from 'cutline';
```

### Step 3: Replace Constructor

```typescript
// Before
const client = axios.create(config);

// After
const client = new Cutline({
  ...config,
  retry: { maxRetries: 3 },
  circuitBreaker: { failureThreshold: 5 }
});
```

### Step 4: Everything else works the same! 🎉

## Best Practices

### 1. Configure Retry Wisely

```typescript
// Good: Reasonable retry settings
retry: {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2
}

// Avoid: Too aggressive retry
retry: {
  maxRetries: 10,        // Too many retries
  retryDelay: 100,       // Too fast
  backoffMultiplier: 3   // Too aggressive backoff
}
```

### 2. Set Appropriate Circuit Breaker Thresholds

```typescript
// Good: Balanced thresholds
circuitBreaker: {
  failureThreshold: 3,     // Not too sensitive
  recoveryTimeout: 30000,  // Reasonable recovery time
  monitoringPeriod: 60000  // Adequate monitoring
}

// Avoid: Too sensitive
circuitBreaker: {
  failureThreshold: 1,     // Too sensitive
  recoveryTimeout: 5000,   // Too fast recovery
  monitoringPeriod: 10000  // Too short monitoring
}
```

### 3. Use TypeScript for Better Type Safety

```typescript
// Define response types
interface User {
  id: number;
  name: string;
  email: string;
}

// Use with Cutline
const response = await client.get<User>('/users/1');
const user: User = response.data;
```

### 4. Monitor Circuit Breaker States

```typescript
// Log circuit breaker state changes
client.interceptors.response.use(
  response => {
    console.log('Success, Circuit Breaker State:', client.getCircuitBreakerState());
    return response;
  },
  error => {
    console.log('Error, Circuit Breaker State:', client.getCircuitBreakerState());
    return Promise.reject(error);
  }
);
```

### 5. Handle Circuit Breaker States Gracefully

```typescript
try {
  const response = await client.get('/users');
} catch (error) {
  if (error.message === 'Circuit breaker is open') {
    // Circuit breaker is open, use fallback or retry later
    console.log('Service is temporarily unavailable');
  } else {
    // Handle other errors
    console.error('Request failed:', error);
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Circuit Breaker Not Opening

- Check `failureThreshold` configuration
- Ensure failures are being counted correctly
- Verify error handling in interceptors

#### 2. Retry Not Working

- Check `maxRetries` configuration
- Verify `retryableStatusCodes` and `retryableErrors`
- Ensure errors are being caught properly

#### 3. Performance Issues

- Reduce `maxRetries` if too many retries
- Increase `retryDelay` if retries are too fast
- Adjust `recoveryTimeout` for circuit breaker

### Debug Mode

Enable debug logging:

```typescript
const client = new Cutline({
  // ... other config
  retry: {
    maxRetries: 3,
    debug: true  // Enable debug logging
  }
});
```

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
