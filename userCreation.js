// userCreation.js (new file - user creation only)
const userService = require('./services/user.service');

async function main() {
    try {
        const results = await userService.createUsersFromCSV('./data/users.csv');
        console.log('User creation results:', results);
        console.log('User creation completed successfully!');
    } catch (error) {
        console.error('User creation error:', error);
        process.exit(1);
    }
}

main();