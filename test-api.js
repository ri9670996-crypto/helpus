// HelpUs Backend API Test Script
// Run this file to test your APIs: node test-api.js

const API_BASE_URL = 'http://localhost:5000/api';

// Test Registration Function
async function testRegistration() {
  try {
    console.log('🚀 Testing Registration API...\n');
    
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        phone_number: '01712345678',
        password: '123456'
      }),
    });

    const data = await response.json();
    
    console.log('📧 Response:', data);
    
    if (data.success) {
      console.log('✅ Registration Successful!');
      console.log('👤 User ID:', data.user_id);
      console.log('🎯 Referral Code:', data.referral_code);
    } else {
      console.log('❌ Registration Failed:', data.error);
    }
  } catch (error) {
    console.log('💥 Connection Error:', error.message);
  }
}

// Test Login Function
async function testLogin() {
  try {
    console.log('\n🔐 Testing Login API...\n');
    
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: '123456'
      }),
    });

    const data = await response.json();
    
    console.log('📧 Response:', data);
    
    if (data.success) {
      console.log('✅ Login Successful!');
      console.log('🔑 Token:', data.token);
    } else {
      console.log('❌ Login Failed:', data.error);
    }
  } catch (error) {
    console.log('💥 Connection Error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Starting HelpUs API Tests...\n');
  
  await testRegistration();
  await testLogin();
  
  console.log('\n🎉 All tests completed!');
}

// Run the tests
runAllTests();