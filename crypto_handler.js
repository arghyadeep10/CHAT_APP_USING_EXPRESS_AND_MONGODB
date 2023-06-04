// npm and core Module Imports
const crypto = require('crypto');

const createHash = crypto.createHash;
const scryptSync = crypto.scryptSync;
const randomBytes = crypto.randomBytes;
const timingSafeEqual = crypto.timingSafeEqual;

function hashPsswd(input){
    return createHash('sha256').update(input).digest('hex');
}

function hashPsswd_with_salt(input_psswd){
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = scryptSync(input_psswd, salt, 64).toString('hex');
    return {
        salt: salt,
        hashedPassword: hashedPassword
    }
}

function compare_psswd_with_salt(input_psswd, salt, psswd){
    const hashedInputPasswordBuffer = scryptSync(input_psswd, salt, 64);
    const hashedDbPasswordBuffer = Buffer.from(psswd, 'hex');
    const isEqual = timingSafeEqual(hashedInputPasswordBuffer, hashedDbPasswordBuffer);
    return isEqual;
}

exports.hashPsswd = hashPsswd;
exports.hashPsswd_with_salt = hashPsswd_with_salt;
exports.compare_psswd_with_salt = compare_psswd_with_salt;