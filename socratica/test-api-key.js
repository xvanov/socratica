#!/usr/bin/env node

/**
 * Quick script to test OpenAI API key
 * Usage: node test-api-key.js
 */

require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
console.log('🧪 Testing API key...\n');

// Simple test - just check if we can make a minimal API call
async function testAPIKey() {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      console.error('❌ Authentication failed - Invalid API key');
      return false;
    }

    if (response.status === 429) {
      const data = await response.json();
      if (data.error?.code === 'insufficient_quota') {
        console.error('❌ Quota exceeded - No credits available');
        console.error('   Error:', data.error.message);
      } else {
        console.error('❌ Rate limit - Too many requests');
      }
      return false;
    }

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      const data = await response.json().catch(() => ({}));
      console.error('   Details:', JSON.stringify(data, null, 2));
      return false;
    }

    console.log('✅ API key is valid!');
    console.log('✅ Quota/Credits available');
    return true;
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }
}

testAPIKey().then(success => {
  process.exit(success ? 0 : 1);
});



