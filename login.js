// login.js (new file - login only)
const salesforceService = require('./services/salesforce.service');

async function main() {
    try {
        await salesforceService.connect();
        console.log('Login successful!');
    } catch (error) {
        console.error('Login error:', error);
        process.exit(1);
    }
}

main();