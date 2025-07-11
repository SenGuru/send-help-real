const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testAPI() {
  try {
    console.log('1. Testing admin login...');
    
    // Login as admin
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@yourbusiness.com',
      password: 'admin123'
    });
    
    console.log('Login successful:', loginResponse.data.success);
    const token = loginResponse.data.data.token;
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.error('No token received from login');
      return;
    }
    
    // Set up headers with token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('\n2. Testing get all users...');
    
    // Get all users
    const usersResponse = await axios.get(`${API_BASE_URL}/api/admin/users`, { headers });
    console.log('Get users successful:', usersResponse.data.success);
    console.log('Number of users:', usersResponse.data.users?.length || 0);
    
    if (usersResponse.data.users && usersResponse.data.users.length > 0) {
      const firstUser = usersResponse.data.users[0];
      console.log('First user ID:', firstUser.id);
      
      console.log('\n3. Testing get user details...');
      
      // Get user details
      const userDetailsResponse = await axios.get(`${API_BASE_URL}/api/admin/users/${firstUser.id}`, { headers });
      console.log('Get user details successful:', userDetailsResponse.data.success);
      console.log('User details:', userDetailsResponse.data);
    } else {
      console.log('No users found to test user details');
    }
    
  } catch (error) {
    console.error('API Test Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testAPI();