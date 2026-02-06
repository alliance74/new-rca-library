// Debug script to test authentication
// Run this in browser console to debug the auth issue

console.log('=== AUTH DEBUG ===');

// Check tokens
const accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');

console.log('Tokens:', {
  access: accessToken ? `${accessToken.substring(0, 50)}...` : null,
  refresh: refreshToken ? `${refreshToken.substring(0, 50)}...` : null
});

// Test API call
if (accessToken) {
  fetch('http://localhost:3001/auth/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('API Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('API Response Data:', data);
  })
  .catch(error => {
    console.error('API Error:', error);
  });
} else {
  console.log('No access token found');
}