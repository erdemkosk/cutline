import { Cutline } from '../dist/index.js';

async function esmExample() {
  console.log('🚀 Cutline HTTP Client - ES Modules Example\n');

  // Example 1: ES Modules import
  console.log('📌 Example 1: ES Modules import');
  const client = new Cutline({
    timeout: 10000,
    retry: {
      maxRetries: 2,
      retryDelay: 500
    }
  });

  try {
    const response = await client.get('https://jsonplaceholder.typicode.com/posts/1');
    console.log('✅ ES Modules GET request:', response.status);
    console.log('📝 Post title:', response.data.title);
  } catch (error) {
    console.log('❌ ES Modules request error:', error.message);
  }

  // Example 2: Multiple services
  console.log('\n📌 Example 2: Multiple services with ES Modules');
  try {
    const [postResponse, statusResponse] = await Promise.all([
      client.get('https://jsonplaceholder.typicode.com/posts/1'),
      client.get('https://httpstat.us/200')
    ]);
    
    console.log('✅ Post service:', postResponse.status);
    console.log('✅ Status service:', statusResponse.status);
  } catch (error) {
    console.log('❌ Multiple services error:', error.message);
  }

  // Example 3: Check client capabilities
  console.log('\n📊 ES Modules Client Status');
  console.log('Circuit Breaker State:', client.getCircuitBreakerState());
  console.log('Retry Configuration:', client.getRetryConfig());

  console.log('\n✨ ES Modules examples completed!');
}

// Run example
esmExample().catch(console.error);
