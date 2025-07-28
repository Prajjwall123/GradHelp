// This script will clean up user data from localStorage
console.log('Cleaning up localStorage...');

// Remove user data from localStorage
localStorage.removeItem('user');

// List all items in localStorage for debugging
console.log('Current localStorage items:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`- ${key}: ${localStorage.getItem(key).substring(0, 50)}${localStorage.getItem(key).length > 50 ? '...' : ''}`);
}

console.log('Cleanup complete. Please refresh your application.');
