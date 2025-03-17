// index.js (modified to complete after login)
const salesforceService = require('./services/salesforce.service');

async function main() {
    try {
        // Establish connection
        await salesforceService.connect();
        
        // Display success message and let the program complete
        console.log('Login successful!');
        
    } catch (error) {
        console.error('Application error:', error);
        process.exit(1);
    }
}

main();