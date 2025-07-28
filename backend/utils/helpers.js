const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate backup codes for MFA
 * @returns {Array} Array of objects with plain and hashed codes
 */
const generateBackupCodes = (count = 10) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(5).toString('hex').toUpperCase();
        const hash = bcrypt.hashSync(code, 10);
        codes.push({
            plain: code,
            hash: hash
        });
    }
    return codes;
};

/**
 * Verify a backup code
 * @param {string} code - The code to verify
 * @param {string} hashedCode - The hashed code to compare against
 * @returns {boolean} True if the code is valid
 */
const verifyBackupCode = (code, hashedCode) => {
    return bcrypt.compareSync(code, hashedCode);
};

module.exports = {
    generateBackupCodes,
    verifyBackupCode
};
