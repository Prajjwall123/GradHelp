const crypto = require('crypto');
const bcrypt = require('bcryptjs');


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


const verifyBackupCode = (code, hashedCode) => {
    return bcrypt.compareSync(code, hashedCode);
};

module.exports = {
    generateBackupCodes,
    verifyBackupCode
};
