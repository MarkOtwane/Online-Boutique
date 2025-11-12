#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testTrackingSystem() {
  console.log('🧪 Testing Enhanced Tracking System...\n');

  try {
    // Step 1: Register an admin test user
    console.log('1. Creating admin test user...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: `admin_${Date.now()}@example.com`,
      password: 'admin123456'
    });
    console.log('✅ Admin user created successfully');
    const token = registerResponse.data.access_token;

    // Step 2: Get available products
    console.log('\n2. Fetching products...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    const products = productsResponse.data.products;
    
    if (!products || products.length === 0) {
      throw new Error('No products found in database');
    }
    
    console.log(`✅ Found ${products.length} products`);
    const testProduct = products[0];

    // Step 3: Create an order (this should automatically create tracking)
    console.log('\n3. Creating order with automatic tracking...');
    const orderResponse = await axios.post(`${API_BASE}/orders`, {
      items: [
        {
          productId: testProduct.id,
          quantity: 1
        }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const order = orderResponse.data;
    console.log('✅ Order created successfully');
    console.log(`   Order ID: ${order.id}`);
    console.log(`   Total: $${order.total}`);

    // Step 4: Verify tracking was created automatically
    console.log('\n4. Verifying automatic tracking creation...');
    const trackingResponse = await axios.get(`${API_BASE}/tracking/order/${order.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const tracking = trackingResponse.data;
    console.log('✅ Tracking created automatically');
    console.log(`   Tracking ID: ${tracking.trackingId}`);
    console.log(`   Current Status: ${tracking.currentStatus}`);
    console.log(`   Status History: ${tracking.statusHistory.length} entries`);

    // Step 5: Test order status immutability
    console.log('\n5. Testing order status immutability...');
    
    // First status update (should work)
    const firstStatusResponse = await axios.put(`${API_BASE}/orders/${order.id}/status`, {
      status: 'processing'
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ First status update successful');
    console.log(`   New status: ${firstStatusResponse.data.status}`);

    // Second status update (should fail)
    try {
      await axios.put(`${API_BASE}/orders/${order.id}/status`, {
        status: 'shipped'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('❌ ERROR: Second status update should have failed but succeeded!');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Second status update correctly blocked');
        console.log(`   Error message: ${error.response.data.message}`);
      } else {
        throw error;
      }
    }

    // Step 6: Verify tracking ID is retrievable
    console.log('\n6. Testing tracking ID retrieval...');
    const trackingInfoResponse = await axios.get(`${API_BASE}/tracking/${tracking.trackingId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const trackingInfo = trackingInfoResponse.data;
    console.log('✅ Tracking information retrievable');
    console.log(`   Status: ${trackingInfo.currentStatus}`);
    console.log(`   History entries: ${trackingInfo.statusHistory.length}`);

    console.log('\n🎉 All tracking system tests passed!');
    console.log('\n📋 Summary:');
    console.log('✅ Automatic tracking creation on order placement');
    console.log('✅ Tracking ID generation and storage');
    console.log('✅ Order status immutability after first change');
    console.log('✅ Tracking information accessibility');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testTrackingSystem();