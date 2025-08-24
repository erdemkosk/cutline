import { Cutline } from '../../src/index';

async function retryCircuitTest() {
  console.log('🔄 Retry + Circuit Breaker Test - Birlikte Nasıl Çalışır?\n');

  const client = new Cutline({
    baseURL: 'https://httpstat.us',
    timeout: 3000,
    // Retry ayarları
    retry: {
      maxRetries: 2,        // 2 retry
      retryDelay: 500,      // 500ms delay
      backoffMultiplier: 2
    },
    // Circuit breaker ayarları
    circuitBreaker: {
      failureThreshold: 3,  // 3 failure'dan sonra açılsın
      recoveryTimeout: 3000, // 3 saniye sonra recovery
      monitoringPeriod: 5000
    }
  });

  console.log('📊 Konfigürasyon:');
  console.log('🔄 Retry: maxRetries=2, delay=500ms');
  console.log('🔌 Circuit Breaker: threshold=3, recovery=3s');
  console.log('🔌 Başlangıç state:', client.getCircuitBreakerState());

  // ============================================================================
  // TEST 1: İlk başarısız istek (retry çalışır, circuit breaker CLOSED)
  // ============================================================================
  console.log('\n📌 Test 1: İlk Başarısız İstek');
  console.log('   Retry çalışmalı, circuit breaker CLOSED kalmalı');
  
  const startTime1 = Date.now();
  
  try {
    await client.get('/404');
  } catch (error: any) {
    const duration = Date.now() - startTime1;
    console.log(`   ❌ İstek başarısız (${duration}ms)`);
    console.log(`   🔄 Retry çalıştı mı? ${duration > 1000 ? 'Evet' : 'Hayır'}`);
    console.log(`   🔌 Circuit Breaker State: ${client.getCircuitBreakerState()}`);
  }

  // ============================================================================
  // TEST 2: İkinci başarısız istek (retry çalışır, circuit breaker CLOSED)
  // ============================================================================
  console.log('\n📌 Test 2: İkinci Başarısız İstek');
  console.log('   Retry çalışmalı, circuit breaker hala CLOSED');
  
  const startTime2 = Date.now();
  
  try {
    await client.get('/500');
  } catch (error: any) {
    const duration = Date.now() - startTime2;
    console.log(`   ❌ İstek başarısız (${duration}ms)`);
    console.log(`   🔄 Retry çalıştı mı? ${duration > 1000 ? 'Evet' : 'Hayır'}`);
    console.log(`   🔌 Circuit Breaker State: ${client.getCircuitBreakerState()}`);
  }

  // ============================================================================
  // TEST 3: Üçüncü başarısız istek (retry çalışır, circuit breaker OPEN olur)
  // ============================================================================
  console.log('\n📌 Test 3: Üçüncü Başarısız İstek');
  console.log('   Retry çalışmalı, circuit breaker OPEN olmalı');
  
  const startTime3 = Date.now();
  
  try {
    await client.get('/503');
  } catch (error: any) {
    const duration = Date.now() - startTime3;
    console.log(`   ❌ İstek başarısız (${duration}ms)`);
    console.log(`   🔄 Retry çalıştı mı? ${duration > 1000 ? 'Evet' : 'Hayır'}`);
    console.log(`   🔌 Circuit Breaker State: ${client.getCircuitBreakerState()}`);
  }

  // ============================================================================
  // TEST 4: Circuit breaker OPEN - istekler retry olmadan reddedilmeli
  // ============================================================================
  console.log('\n📌 Test 4: Circuit Breaker OPEN - Retry Yok');
  console.log('   Circuit breaker OPEN, istekler hemen reddedilmeli');
  
  if (client.getCircuitBreakerState() === 'OPEN') {
    console.log('   ✅ Circuit breaker OPEN state\'de');
    
    const startTime4 = Date.now();
    
    try {
      await client.get('/200');
      console.log('   ❌ Bu istek reddedilmeliydi!');
    } catch (error: any) {
      const duration = Date.now() - startTime4;
      console.log(`   ✅ İstek reddedildi (${duration}ms)`);
      
      if (error.message === 'Circuit breaker is open') {
        console.log('   ✅ Circuit breaker mesajı doğru');
        console.log('   🔄 Retry çalıştı mı? Hayır (çok hızlı)');
      } else {
        console.log('   ❌ Beklenmeyen hata:', error.message);
      }
    }
  } else {
    console.log('   ❌ Circuit breaker OPEN olmadı');
  }

  // ============================================================================
  // TEST 5: Recovery timeout sonrası HALF_OPEN
  // ============================================================================
  console.log('\n📌 Test 5: Recovery Timeout - HALF_OPEN');
  console.log('   Circuit breaker HALF_OPEN\'a geçmeli');
  
  if (client.getCircuitBreakerState() === 'OPEN') {
    console.log('   ⏰ Recovery timeout bekleniyor (3 saniye)...');
    
    const startTime = Date.now();
    let currentState = client.getCircuitBreakerState();
    
    while (currentState === 'OPEN') {
      await new Promise(resolve => setTimeout(resolve, 500));
      currentState = client.getCircuitBreakerState();
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (elapsed % 1 === 0) {
        console.log(`   ⏰ ${elapsed}s: ${currentState}`);
      }
    }
    
    console.log(`   ✅ Circuit breaker ${currentState} state'e geçti`);
  }

  // ============================================================================
  // TEST 6: HALF_OPEN'da istek testi
  // ============================================================================
  console.log('\n📌 Test 6: HALF_OPEN State Test');
  
  if (client.getCircuitBreakerState() === 'HALF_OPEN') {
    console.log('   🔄 HALF_OPEN state - istek yapılıyor...');
    
    const startTime = Date.now();
    
    try {
      const response = await client.get('/200');
      const duration = Date.now() - startTime;
      console.log(`   ✅ HALF_OPEN'da başarılı istek (${duration}ms)`);
      console.log(`   🔌 Yeni state: ${client.getCircuitBreakerState()}`);
      
      if (client.getCircuitBreakerState() === 'CLOSED') {
        console.log('   🎉 Circuit breaker CLOSED state\'e döndü!');
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.log(`   ❌ HALF_OPEN'da hata (${duration}ms):`, error.message);
    }
  }

  // ============================================================================
  // SONUÇ
  // ============================================================================
  console.log('\n📋 SONUÇ: Retry + Circuit Breaker Nasıl Çalışır?');
  console.log('• İlk 2 failure: Retry çalışır, circuit breaker CLOSED');
  console.log('• 3. failure: Retry çalışır, circuit breaker OPEN olur');
  console.log('• OPEN state: İstekler retry olmadan hemen reddedilir');
  console.log('• Recovery timeout: HALF_OPEN\'a geçer');
  console.log('• HALF_OPEN: İstek yapılır, başarılı olursa CLOSED\'a döner');
  console.log('• HALF_OPEN: İstek başarısız olursa tekrar OPEN olur');
  
  console.log('\n🎯 ÖZET:');
  console.log('✅ Retry ve Circuit Breaker BİRLİKTE çalışır');
  console.log('✅ Retry: İlk failure\'larda aktif');
  console.log('✅ Circuit Breaker: Çok fazla failure\'da devreye girer');
  console.log('✅ OPEN state\'de retry devre dışı (hızlı rejection)');
  console.log('✅ HALF_OPEN state\'de retry tekrar aktif');
}

// Run test
if (require.main === module) {
  retryCircuitTest().catch(console.error);
}
