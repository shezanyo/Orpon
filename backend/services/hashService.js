const crypto = require("crypto");

const generateHash = (
    amount,
    donor,
    timestamp,
    previousHash
) => {
    const rawData =
        amount +
        donor +
        timestamp +
        previousHash;

    const hash = crypto
        .createHash("sha256")
        .update(rawData)
        .digest("hex");

    return hash;
};

module.exports = {
    generateHash
};  