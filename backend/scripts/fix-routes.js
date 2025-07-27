const fs = require('fs');
const path = require('path');

const routeFiles = [
    'applicationDecisionRoutes.js',
    'applicationRoutes.js',
    'authRoutes.js',
    'contactRoutes.js',
    'fileRoutes.js',
    'paymentRoutes.js',
    'profileRoutes.js',
    'scholarshipApplicationRoutes.js',
    'scholarshipDecisionRoutes.js',
    'userRoutes.js',
    'aiRoutes.js'
];

const routesPath = path.join(__dirname, '..', 'routes');

routeFiles.forEach(file => {
    const filePath = path.join(routesPath, file);
    
    // Skip if file doesn't exist
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${file} - file not found`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Update router.use(auth) to use arrow function
    if (content.includes('router.use(auth)')) {
        content = content.replace(
            /router\.use\(auth\)/g,
            'router.use((req, res, next) => auth(req, res, next))'
        );
        updated = true;
    }
    
    // Update router.use(adminAuth) to use arrow function
    if (content.includes('router.use(adminAuth)')) {
        content = content.replace(
            /router\.use\(adminAuth\)/g,
            'router.use((req, res, next) => adminAuth(req, res, next))'
        );
        updated = true;
    }
    
    // Update inline middleware usage (e.g., router.get("/", auth, handler))
    const routeMethods = ['get', 'post', 'put', 'delete', 'patch'];
    routeMethods.forEach(method => {
        const regex = new RegExp(`router\.${method}\([^,]+?,\s*(auth|adminAuth)(?=[,)])`, 'g');
        content = content.replace(
            regex,
            (match, middleware) => {
                updated = true;
                return match.replace(middleware, `(req, res, next) => ${middleware}(req, res, next)`);
            }
        );
    });
    
    if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`No changes needed for ${file}`);
    }
});

console.log('Route files update complete!');
