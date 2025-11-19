// Test script to check all pages
const pages = [
  '/',
  '/activity',
  '/community',
  '/friends',
  '/groups',
  '/leaderboard',
  '/login',
  '/messages',
  '/notifications',
  '/profile/testuser',
  '/settings',
  '/signin',
  '/social-proof'
];

console.log('Testing all pages...\n');

async function testPages() {
  for (const page of pages) {
    try {
      const response = await fetch(`http://localhost:3000${page}`);
      const status = response.status;
      const statusText = status === 200 ? '✓ OK' : '✗ FAILED';
      console.log(`${statusText} - ${page} (Status: ${status})`);
    } catch (error) {
      console.log(`✗ ERROR - ${page}: ${error.message}`);
    }
  }
}

testPages().then(() => {
  console.log('\nTest complete!');
  process.exit(0);
});
