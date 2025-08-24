import { Cutline } from '../../src/index';

async function axiosWrapperExample() {
  console.log('🚀 Cutline - Axios Wrapper Examples\n');

  // Example 1: Axios benzeri kullanım
  console.log('📌 Example 1: Axios benzeri kullanım');
  const client = new Cutline({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 10000,
    headers: {
      'User-Agent': 'Cutline-Axios-Wrapper/1.0.0'
    },
    // Sadece bizim eklediğimiz özellikler
    retry: {
      maxRetries: 3,
      retryDelay: 1000
    },
    circuitBreaker: {
      failureThreshold: 2,
      recoveryTimeout: 10000
    }
  });

  try {
    // Axios'un tüm özellikleri çalışır
    const response = await client.get('/posts/1', {
      params: { _limit: 1 },
      headers: { 'X-Custom': 'value' },
      timeout: 5000
    });
    console.log('✅ Axios-like GET:', response.status);
    console.log('📝 Data:', response.data.title);
  } catch (error: any) {
    console.log('❌ Axios-like GET error:', error.message);
  }

  // Example 2: Axios'un tüm method'ları
  console.log('\n📌 Example 2: Axios\'un tüm method\'ları');
  try {
    // GET
    const getResponse = await client.get('/posts/1');
    console.log('✅ GET:', getResponse.status);

    // POST
    const postResponse = await client.post('/posts', {
      title: 'Axios Wrapper Post',
      body: 'This post uses Axios-like API',
      userId: 1
    });
    console.log('✅ POST:', postResponse.status);

    // PUT
    const putResponse = await client.put('/posts/1', {
      title: 'Updated via Axios Wrapper',
      body: 'Updated body',
      userId: 1
    });
    console.log('✅ PUT:', putResponse.status);

    // DELETE
    const deleteResponse = await client.delete('/posts/1');
    console.log('✅ DELETE:', deleteResponse.status);

    // PATCH
    const patchResponse = await client.patch('/posts/1', {
      title: 'Patched via Axios Wrapper'
    });
    console.log('✅ PATCH:', patchResponse.status);

    // HEAD
    const headResponse = await client.head('/posts/1');
    console.log('✅ HEAD:', headResponse.status);

    // OPTIONS
    const optionsResponse = await client.options('/posts/1');
    console.log('✅ OPTIONS:', optionsResponse.status);

  } catch (error: any) {
    console.log('❌ Method test error:', error.message);
  }

  // Example 3: Axios interceptors
  console.log('\n📌 Example 3: Axios interceptors');
  try {
    // Request interceptor
    client.interceptors.request.use(
      (config) => {
        console.log('🔧 Request interceptor:', config.url);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    client.interceptors.response.use(
      (response) => {
        console.log('📡 Response interceptor:', response.status);
        return response;
      },
      (error) => {
        console.log('❌ Response interceptor error:', error.message);
        return Promise.reject(error);
      }
    );

    const response = await client.get('/posts/1');
    console.log('✅ Interceptors test:', response.status);

  } catch (error: any) {
    console.log('❌ Interceptors error:', error.message);
  }

  // Example 4: Axios defaults
  console.log('\n📌 Example 4: Axios defaults');
  try {
    console.log('🔧 Default baseURL:', client.defaults.baseURL);
    console.log('🔧 Default timeout:', client.defaults.timeout);
    console.log('🔧 Default headers:', client.defaults.headers);

    // Defaults'ı değiştir
    client.defaults.timeout = 15000;
    console.log('🔧 Updated timeout:', client.defaults.timeout);

  } catch (error: any) {
    console.log('❌ Defaults error:', error.message);
  }

  // Example 5: Complex Axios config
  console.log('\n📌 Example 5: Complex Axios config');
  try {
    const response = await client.request({
      method: 'POST',
      url: '/posts',
      data: {
        title: 'Complex Request',
        body: 'Using full Axios config',
        userId: 1
      },
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Type': 'complex'
      },
      params: {
        _validate: true
      },
      timeout: 8000,
      // Bizim eklediğimiz özellikler
      retry: {
        maxRetries: 2,
        retryDelay: 500
      }
    });
    console.log('✅ Complex request:', response.status);

  } catch (error: any) {
    console.log('❌ Complex request error:', error.message);
  }

  // Example 6: Circuit breaker ve retry durumu
  console.log('\n📊 Circuit Breaker ve Retry Durumu');
  console.log('🔌 Circuit Breaker State:', client.getCircuitBreakerState());
  console.log('🔄 Retry Config:', client.getRetryConfig());

  // Example 7: Axios utility methods
  console.log('\n📌 Example 7: Axios utility methods');
  try {
    const uri = client.getUri({
      url: '/posts',
      params: { _limit: 5 }
    });
    console.log('🔗 Generated URI:', uri);

  } catch (error: any) {
    console.log('❌ Utility methods error:', error.message);
  }

  // Example 8: Error handling (Axios style)
  console.log('\n📌 Example 8: Error handling (Axios style)');
  try {
    await client.get('/nonexistent-endpoint');
  } catch (error: any) {
    if (error.response) {
      // Server responded with error status
      console.log('❌ Server error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.log('❌ Network error:', error.request);
    } else {
      // Something else happened
      console.log('❌ Other error:', error.message);
    }
  }

  console.log('\n✨ Axios wrapper examples completed!');
}

// Run example
if (require.main === module) {
  axiosWrapperExample().catch(console.error);
}
