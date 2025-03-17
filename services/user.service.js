const fs = require('fs');
const csv = require('csv-parser');
const salesforceService = require('./salesforce.service');
const logger = require('../utils/logger');

class UserService {
    async createUsersFromCSV(csvFilePath) {
        try {
            const conn = await salesforceService.connect();
            
            // Fetch all roles from Salesforce to map names to IDs
            const roleRecords = await conn.query("SELECT Id, Name FROM UserRole");
            const roleMap = new Map(roleRecords.records.map(role => [role.Name, role.Id]));
            
            // Fetch all profiles from Salesforce to map names to IDs
            const profileRecords = await conn.query("SELECT Id, Name FROM Profile");
            const profileMap = new Map(profileRecords.records.map(profile => [profile.Name, profile.Id]));
            
            const users = [];
            
            await new Promise((resolve, reject) => {
                fs.createReadStream(csvFilePath)
                    .pipe(csv())
                    .on('data', (row) => {
                        const roleName = row.Role || '';
                        const roleId = roleMap.get(roleName) || null;
                        
                        const profileName = row.Profile || '';
                        const profileId = profileMap.get(profileName);
                        
                        if (roleName && !roleId) {
                            logger.warn(`Role '${roleName}' not found in Salesforce for user ${row.Username}`);
                        }
                        if (profileName && !profileId) {
                            logger.error(`Profile '${profileName}' not found in Salesforce for user ${row.Username}`);
                            return; // Skip this user if profile is invalid (ProfileId is required)
                        }

                        users.push({
                            Username: row.Username,
                            Email: row.Email,
                            FirstName: row['First Name'],
                            Middle_Name__c: row['Middle Name'] || '', // Updated to use custom field
                            LastName: row['Last Name'],
                            Alias: this.generateAlias(row['First Name'], row['Last Name']),
                            ProfileId: profileId, // Use mapped Profile ID
                            UserRoleId: roleId, // Use mapped Role ID
                            TimeZoneSidKey: 'America/Los_Angeles',
                            LocaleSidKey: 'en_US',
                            EmailEncodingKey: 'UTF-8',
                            LanguageLocaleKey: 'en_US'
                        });
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });

            const results = await Promise.all(
                users.map(async (user) => {
                    try {
                        const result = await conn.sobject('User').create(user);
                        if (result.success) {
                            logger.info(`Created user: ${user.Username}`, { id: result.id });
                            return { username: user.Username, id: result.id };
                        } else {
                            logger.error(`Failed to create user: ${user.Username}`, result.errors);
                            return { username: user.Username, error: result.errors };
                        }
                    } catch (error) {
                        logger.error(`Error creating user: ${user.Username}`, error);
                        return { username: user.Username, error };
                    }
                })
            );

            return results;

        } catch (error) {
            logger.error('Error in createUsersFromCSV', error);
            throw error;
        }
    }

    generateAlias(firstName, lastName) {
        const first = firstName ? firstName.substring(0, 1) : '';
        const last = lastName ? lastName.substring(0, 7) : '';
        return (first + last).toLowerCase();
    }
}

module.exports = new UserService();