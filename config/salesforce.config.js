require('dotenv').config();

module.exports = {
    salesforce: {
        username: process.env.SF_USERNAME,
        password: process.env.SF_PASSWORD,
        securityToken: process.env.SF_SECURITY_TOKEN,
        loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com'
    }
};