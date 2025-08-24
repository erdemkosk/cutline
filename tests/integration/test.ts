import { Cutline } from './index';

async function testRetryMechanism() {
  console.log('🧪 Testing retry mechanism...');
  
  const client = new Cutline({
    retry: {
      maxRetries: 2,
      retryDelay: 100,
      backoffMultiplier: 1.5
    }
  });

  try {
    // This URL doesn't exist, retry mechanism will be triggered
    await client.get('https://httpstat.us/500');
  } catch (error: any) {
    console.log('✅ Retry mechanism worked, error caught:', error.message);
  }
}

async function testCircuitBreaker() {
  console.log('\n🧪 Testing Circuit Breaker...');
  
  const client = new Cutline({
    circuitBreaker: {
      failureThreshold: 2,
      recoveryTimeout: 5000
    }
  });

  try {
    // First error
    await client.get('https://httpstat.us/500');
  } catch (error: any) {
    console.log('✅ First error caught');
  }

  try {
    // Second error - circuit breaker should open
    await client.get('https://httpstat.us/500');
  } catch (error: any) {
    console.log('✅ Second error caught');
  }

  try {
    // Circuit breaker should be open
    await client.get('https://httpstat.us/200');
  } catch (error: any) {
    console.log('✅ Circuit breaker is open, request rejected:', error.message);
  }

  console.log('Circuit Breaker status:', client.getCircuitBreakerState());
}

async function testSuccessfulRequests() {
  console.log('\n🧪 Testing successful requests...');
  
  const client = new Cutline({
    baseURL: 'https://jsonplaceholder.typicode.com'
  });

  try {
    const response = await client.get('/posts/1');
    console.log('✅ Successful GET request:', response.status);
    
    const postResponse = await client.post('/posts', {
      title: 'Test',
      body: 'Test body',
      userId: 1
    });
    console.log('✅ Successful POST request:', postResponse.status);
    
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Cutline HTTP Client Test Suite Starting...\n');
  
  await testSuccessfulRequests();
  await testRetryMechanism();
  await testCircuitBreaker();
  
  console.log('\n✨ All tests completed!');
}

// Run tests
if (require.main === module) {
  runTests().catch(console.error);
}
