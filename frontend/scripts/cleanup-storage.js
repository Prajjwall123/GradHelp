// This script will clean up user data from sessionStorage

// Remove specific items from sessionStorage
sessionStorage.removeItem('access_token');
sessionStorage.removeItem('refresh_token');
sessionStorage.removeItem('user_info');
sessionStorage.removeItem('csrfToken');

// List all items in sessionStorage for debugging
console.log('Current sessionStorage items:');
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  console.log(`- ${key}: ${sessionStorage.getItem(key).substring(0, 50)}${sessionStorage.getItem(key).length > 50 ? '...' : ''}`);
}

console.log('Cleanup completed.');
