const fs = require('fs');
const csv = require('csv-parser');
const salesforceService = require('./services/salesforce.service');
const logger = require('./utils/logger');

async function changePasswordsFromCSV(csvFilePath) {
    try {
        const conn = await salesforceService.connect();
        
        const usernames = [];
        
        // Read usernames from CSV
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (row) => {
                    if (row.Username) {
                        usernames.push(row.Username);
                    }
                })
                .on('end', resolve)
                .on('error', reject);
        });

        const results = await Promise.all(
            usernames.map(async (username) => {
                try {
                    // Check if user exists
                    const userQuery = await conn.query(`SELECT Id FROM User WHERE Username = '${username}' LIMIT 1`);
                    const userExists = userQuery.records.length > 0;
                    const userId = userExists ? userQuery.records[0].Id : null;

                    if (userExists) {
                        // Use REST API to set password
                        await conn.requestPost(`/services/data/v59.0/sobjects/User/${userId}/password`, {
                            NewPassword: 'PasswordNew001'
                        });
                        logger.info(`Password reset for existing user: ${username}`, { id: userId });
                        return { username, id: userId, action: 'reset' };
                    } else {
                        // Log warning if user doesn't exist
                        logger.warn(`User not found, skipping password change: ${username}`);
                        return { username, error: 'User not found' };
                    }
                } catch (error) {
                    logger.error(`Error processing password change for user: ${username}`, error);
                    return { username, error };
                }
            })
        );

        console.log('Password change results:', results);
        console.log('Password change process completed successfully!');
        return results;

    } catch (error) {
        logger.error('Error in changePasswordsFromCSV', error);
        throw error;
    }
}

async function main() {
    try {
        await changePasswordsFromCSV('./data/passwords.csv');
    } catch (error) {
        console.error('Password change error:', error);
        process.exit(1);
    }
}

main();