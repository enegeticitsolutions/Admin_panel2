import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(__dirname, '../../apps/api/.env') });

import { checkRedisHealth, getRedisClient } from './src/redis/redis.connection';
import { NotificationConsumer } from './src/redis/notification.consumer';
import { notificationProducer } from './src/redis/notification.producer';

async function testE2E() {
  console.log('========================================================================');
  console.log('🧪 END-TO-END CODE ACTION & NOTIFICATION TEST');
  console.log('========================================================================\n');

  console.log('Step 1: Checking Redis Connection...');
  const isHealthy = await checkRedisHealth();
  console.log(`Redis Health: ${isHealthy ? '✅ Connected (PONG)' : '❌ Not running on localhost:6379'}`);

  if (!isHealthy) {
    console.log('\n⚠️ Redis is not running locally. In production or local dev, Redis must be started');
    console.log('   (e.g., via Docker or redis-server) for Redis Streams microservice decoupling.');
    console.log('   Testing direct Producer fallback / event emission verification...\n');
  }

  // Start Consumer if Redis is healthy
  let consumer: NotificationConsumer | null = null;
  if (isHealthy) {
    console.log('\nStep 2: Starting Notification Consumer Worker in background...');
    consumer = new NotificationConsumer();
    await consumer.start();
    console.log('✅ Notification Consumer active and polling Redis Streams.');
  }

  console.log('\nStep 3: Triggering real code action [BENEF_PROFILE_CREATED] (NT-005)...');
  console.log('Simulating beneficiary profile created via beneficiary_service.ts...');

  const publishResult = await notificationProducer.publish({
    idempotencyKey: `test-e2e-benef-${Date.now()}`,
    channel: 'whatsapp',
    event: 'BENEF_PROFILE_CREATED',
    recipient: { phone: '9305951785' },
    variables: {
      beneficiaryName: 'Mr. Ramesh Kumar (Live Action Test)',
      subscriberName: 'Rajeev Kumar',
    },
  });

  console.log('Producer publish result:', publishResult);

  console.log('\nStep 4: Triggering real code action [CC_PERFORMANCE_RATING] (NT-065)...');
  console.log('Simulating Care Mitra visit rating via visit_service.ts...');

  const ratingResult = await notificationProducer.publish({
    idempotencyKey: `test-e2e-rating-${Date.now()}`,
    channel: 'whatsapp',
    event: 'CC_PERFORMANCE_RATING',
    recipient: { phone: '9305951785' },
    variables: {
      rating: '5',
      beneficiaryName: 'Mr. Ramesh Kumar',
      comment: 'Care Mitra was punctual, verified vitals accurately, and was very courteous.',
    },
  });

  console.log('Rating publish result:', ratingResult);

  console.log('\nStep 5: Triggering real code action [PAYMENT_SUCCESS] (NT-044) with fixed variables...');
  const paymentResult = await notificationProducer.publish({
    idempotencyKey: `test-e2e-payment-${Date.now()}`,
    channel: 'whatsapp',
    event: 'PAYMENT_SUCCESS',
    recipient: { phone: '9305951785' },
    variables: {
      subscriberName: 'Rajeev Kumar',
      amount: '4,999',
      transactionId: 'PAY-ORD-99124',
    },
  });
  console.log('Payment publish result:', paymentResult);

  // Wait 3 seconds to let consumer process
  if (isHealthy && consumer) {
    console.log('\nWaiting 3 seconds for consumer to process stream entries...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await consumer.stop();
  }

  console.log('\n========================================================================');
  console.log('✅ End-to-end action test cycle finished.');
  console.log('========================================================================');
  process.exit(0);
}

testE2E();
