# Cutline - Axios Wrapper with Retry & Circuit Breaker

A powerful **Axios wrapper** that adds automatic retry mechanism and circuit breaker functionality. **100% Axios compatible** - just add retry and circuit breaker features to your existing Axios setup!

## 🚀 Features

- **🔄 Automatic Retry**: Exponential backoff with configurable retry logic
- **⚡ Circuit Breaker**: Smart error handling to protect service health
- **🔄 100% Axios Compatible**: All Axios features work exactly the same
- **📦 Zero Breaking Changes**: Drop-in replacement for Axios
- **🛡️ TypeScript Support**: Full type safety with Axios types
- **⚙️ Easy Migration**: Just replace `axios` with `cutline`

## 📦 Installation

```bash
npm install cutline
```

## 🔧 Quick Start

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

// ✅ Complex requests work
const response = await client.request({
  method: 'POST',
  url: '/users',
  data: { name: 'John' },
  headers: { 'Content-Type': 'application/json' }
});
```

## 🎯 Why Cutline?

### **Before (Axios Only)**
```typescript
// ❌ Manual retry logic needed
let retries = 0;
const maxRetries = 3;

while (retries < maxRetries) {
  try {
    const response = await axios.get('/api/users');
    break;
  } catch (error) {
    retries++;
    if (retries === maxRetries) throw error;
    await new Promise(resolve => setTimeout(resolve, 1000 * retries));
  }
}
```

### **After (Cutline)**
```typescript
// ✅ Automatic retry + circuit breaker
const client = new Cutline({
  retry: { maxRetries: 3 },
  circuitBreaker: { failureThreshold: 5 }
});

const response = await client.get('/api/users'); // That's it!
```

## 🔧 Usage Examples

### Basic Usage (Axios Style)

```typescript
import { Cutline } from 'cutline';

const client = new Cutline({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Authorization': 'Bearer your-token'
  },
  // Add retry and circuit breaker
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2
  },
  circuitBreaker: {
    failureThreshold: 5,
    recoveryTimeout: 60000
  }
});

// Use exactly like Axios
const users = await client.get('/users');
const newUser = await client.post('/users', { name: 'John' });
const updatedUser = await client.put('/users/1', { name: 'John Updated' });
await client.delete('/users/1');
```

### Advanced Axios Features

```typescript
// ✅ Interceptors work
client.interceptors.request.use(config => {
  config.headers['X-Request-ID'] = generateId();
  return config;
});

client.interceptors.response.use(
  response => response,
  error => {
    console.error('Request failed:', error);
    return Promise.reject(error);
  }
);

// ✅ Defaults work
client.defaults.timeout = 15000;
client.defaults.headers.common['X-API-Key'] = 'your-api-key';

// ✅ All HTTP methods work
await client.get('/users');
await client.post('/users', data);
await client.put('/users/1', data);
await client.delete('/users/1');
await client.patch('/users/1', data);
await client.head('/users');
await client.options('/users');
```

### Error Handling (Axios Style)

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

## ⚙️ Configuration

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

## 🔍 Circuit Breaker States

- **CLOSED**: Normal operation state
- **OPEN**: Too many failures, requests are rejected
- **HALF_OPEN**: In recovery process, limited requests accepted

## 📚 API Reference

### Cutline Constructor
```typescript
new Cutline(config?: CutlineConfig)
```

### CutlineConfig (extends AxiosRequestConfig)
```typescript
interface CutlineConfig extends AxiosRequestConfig {
  retry?: Partial<RetryConfig>;
  circuitBreaker?: Partial<CircuitBreakerConfig>;
}
```

### All Axios Methods Available
- `get<T>(url, config?)`
- `post<T>(url, data?, config?)`
- `put<T>(url, data?, config?)`
- `delete<T>(url, config?)`
- `patch<T>(url, data?, config?)`
- `head<T>(url, config?)`
- `options<T>(url, config?)`
- `request<T>(config)`

### Additional Methods
- `getCircuitBreakerState()`: Get circuit breaker state
- `resetCircuitBreaker()`: Reset circuit breaker
- `getRetryConfig()`: Get retry configuration

## 🧪 Testing

```bash
# Development
npm run dev

# Build
npm run build

# Run tests
npm test                    # All tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only

# Run examples
npm run example:axios      # Axios wrapper examples
npm run example            # Basic examples

# JavaScript examples
npm run example:js         # JavaScript usage examples
npm run example:esm        # ES Modules examples
```

## 📝 Examples

### TypeScript Examples
- `examples/typescript/axios-wrapper-example.ts` - Axios wrapper examples
- `examples/typescript/example.ts` - Basic usage examples

### JavaScript Examples
- `examples/javascript/javascript-example.js` - JavaScript usage examples
- `examples/esm-example.mjs` - ES Modules examples

## 🔄 Migration from Axios

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

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues, please open an issue or submit a pull request.
