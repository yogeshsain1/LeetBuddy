// Test script to create test users and a chat room
// Run with: node test-create-room.js

const http = require('http');

async function createTestRoom() {
  try {
    console.log('Creating test chat room...');
    
    const postData = JSON.stringify({
      otherUserId: 2,
      type: 'direct'
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/rooms',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const result = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
    
    if (result.success) {
      console.log('✓ Test room created successfully!');
      console.log('  Room ID:', result.data.roomId);
      console.log('\nYou can now test real-time chat at:');
      console.log('  http://localhost:3000/messages');
      console.log('\nTo test with two users:');
      console.log('  1. Open the messages page in two browser tabs');
      console.log('  2. Send messages from one tab');
      console.log('  3. Watch them appear in real-time in the other tab!');
    } else {
      console.log('Room already exists or created:', result.data.message);
    }
  } catch (error) {
    console.error('Error creating test room:', error.message);
    console.log('\nMake sure the dev server is running:');
    console.log('  npm run dev');
  }
}

createTestRoom();
