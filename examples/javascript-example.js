const { Cutline } = require('../dist/index.js');

async function javascriptExample() {
  console.log('🚀 Cutline HTTP Client - JavaScript Example\n');

  // Example 1: With baseURL configuration
  console.log('📌 Example 1: With baseURL configuration');
  const clientWithBaseURL = new Cutline({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 10000,
    retry: {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2
    },
    circuitBreaker: {
      failureThreshold: 3,
      recoveryTimeout: 30000
    },
    headers: {
      'User-Agent': 'Cutline-HTTP-Client/1.0.0'
    }
  });

  try {
    const response = await clientWithBaseURL.get('/posts/1');
    console.log('✅ GET Response with baseURL:', response.data.title);
  } catch (error) {
    console.log('❌ Error with baseURL:', error.message);
  }

  // Example 2: Without baseURL - using full URLs
  console.log('\n📌 Example 2: Without baseURL - using full URLs');
  const clientWithoutBaseURL = new Cutline({
    timeout: 10000,
    retry: {
      maxRetries: 2,
      retryDelay: 500,
      backoffMultiplier: 1.5
    },
    circuitBreaker: {
      failureThreshold: 2,
      recoveryTimeout: 15000
    }
  });

  try {
    // Using full URL
    const response1 = await clientWithoutBaseURL.get('https://jsonplaceholder.typicode.com/posts/1');
    console.log('✅ GET Response with full URL:', response1.data.title);

    // Another service with full URL
    const response2 = await clientWithoutBaseURL.get('https://httpstat.us/200');
    console.log('✅ GET Response from different service:', response2.status);

    // POST request with full URL
    const postResponse = await clientWithoutBaseURL.post('https://jsonplaceholder.typicode.com/posts', {
      title: 'Test Post',
      body: 'This is a test post',
      userId: 1
    });
    console.log('✅ POST Response with full URL:', postResponse.status);

  } catch (error) {
    console.log('❌ Error without baseURL:', error.message);
  }

  // Example 3: Minimal configuration
  console.log('\n📌 Example 3: Minimal configuration (no baseURL)');
  const simpleClient = new Cutline();
  
  try {
    const response = await simpleClient.get('https://jsonplaceholder.typicode.com/posts/1');
    console.log('✅ Simple GET request:', response.status);
  } catch (error) {
    console.log('❌ Simple request error:', error.message);
  }

  // Example 4: Check client status
  console.log('\n📊 Service Status Monitoring');
  console.log('Circuit Breaker State (with baseURL):', clientWithBaseURL.getCircuitBreakerState());
  console.log('Circuit Breaker State (without baseURL):', clientWithoutBaseURL.getCircuitBreakerState());
  
  console.log('Retry Config (with baseURL):', clientWithBaseURL.getRetryConfig());
  console.log('Retry Config (without baseURL):', clientWithoutBaseURL.getRetryConfig());

  console.log('\n✨ JavaScript examples completed!');
}

// Run example
if (require.main === module) {
  javascriptExample().catch(console.error);
}
