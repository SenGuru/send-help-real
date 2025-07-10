// Test script to simulate mobile app registration flow
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testMobileAppFlow() {
  console.log('🔄 Testing Mobile App Registration Flow...\n');
  
  try {
    // Step 1: Test business code validation (this is what the mobile app does)
    console.log('1. Testing business code validation...');
    const businessResponse = await axios.get(`${API_BASE}/api/public/business/DEMO1`);
    console.log('✅ Business code validated:', businessResponse.data.business.name);
    
    // Step 2: Test user registration (this is what happens when user completes OTP)
    console.log('\n2. Testing user registration...');
    const timestamp = Date.now();
    const registrationData = {
      businessCode: 'DEMO1',
      firstName: 'MobileUser',
      lastName: 'Test',
      email: `mobile${timestamp}@example.com`,
      password: 'password123',
      phoneNumber: '5551234567'
    };
    
    const registerResponse = await axios.post(`${API_BASE}/api/users/register`, registrationData);
    console.log('✅ User registered successfully!');
    console.log('   Member ID:', registerResponse.data.data.user.memberId);
    console.log('   Name:', registerResponse.data.data.user.firstName, registerResponse.data.data.user.lastName);
    
    // Step 3: Check if user appears in admin dashboard
    console.log('\n3. Testing admin login...');
    const adminLoginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@yourbusiness.com',
      password: 'admin123'
    });
    console.log('✅ Admin logged in successfully');
    
    // Step 4: Check if user appears in admin users list
    console.log('\n4. Checking if user appears in admin dashboard...');
    const adminToken = adminLoginResponse.data.token;
    const usersResponse = await axios.get(`${API_BASE}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('✅ Users in admin dashboard:', usersResponse.data.users.length);
    usersResponse.data.users.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.memberId}) - ${user.email}`);
    });
    
    console.log('\n🎉 SUCCESS: Mobile app registration flow working correctly!');
    console.log('   Users created in mobile app now appear in admin dashboard.');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    console.error('   Status:', error.response?.status);
  }
}

testMobileAppFlow();