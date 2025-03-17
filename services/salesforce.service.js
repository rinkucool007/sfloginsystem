// services/salesforce.service.js (simplified)
const jsforce = require('jsforce');
const { salesforce: config } = require('../config/salesforce.config');
const logger = require('../utils/logger');

class SalesforceService {
    constructor() {
        this.connection = null;
    }

    async connect() {
        try {
            this.connection = new jsforce.Connection({
                loginUrl: config.loginUrl
            });

            const credentials = `${config.password}${config.securityToken || ''}`;
            const userInfo = await this.connection.login(config.username, credentials);
            
            logger.info('Salesforce connection established', {
                userId: userInfo.id,
                orgId: userInfo.organizationId
            });

            return this.connection;
        } catch (error) {
            logger.error('Salesforce connection failed', error);
            throw error;
        }
    }
}

module.exports = new SalesforceService();