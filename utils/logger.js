// utils/logger.js
class Logger {
    info(message, data = {}) {
        console.log(`[INFO] ${message}`, data);
    }

    error(message, error = {}) {
        console.error(`[ERROR] ${message}`, error);
    }
}

module.exports = new Logger();