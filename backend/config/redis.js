const redis = require("redis");
require("dotenv").config();

const useRedis = process.env.USE_REDIS === "true";
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient = null;
const fallbackMap = new Map();

if (useRedis) {
    console.log("Redis enabled via configuration. Connecting to:", redisUrl);
    redisClient = redis.createClient({
        url: redisUrl
    });

    redisClient.on("error", (err) => {
        console.error("Redis Client Connection/Runtime Error:", err);
    });

    redisClient.connect().then(() => {
        console.log("Connected to Redis successfully!");
    }).catch((err) => {
        console.error("Failed to connect to Redis server. Operating in fallback Map mode.", err);
    });
} else {
    console.log("Redis not enabled. Operating in local memory fallback Map mode.");
}

/**
 * Check if the Redis client is connected and active
 * @returns {boolean}
 */
const isRedisActive = () => {
    return useRedis && redisClient && redisClient.isOpen;
};

/**
 * Cache pending payment transaction details
 * @param {string} key - Unique checkout session key
 * @param {object} value - Session metadata
 * @param {number} expirySeconds - Cache timeout (defaults to 1 hour / 3600 seconds)
 */
const setPendingPayment = async (key, value, expirySeconds = 3600) => {
    try {
        if (isRedisActive()) {
            await redisClient.setEx(key, expirySeconds, JSON.stringify(value));
        } else {
            fallbackMap.set(key, value);
            // Set auto-expiry cleanup for the in-memory fallback
            setTimeout(() => {
                fallbackMap.delete(key);
            }, expirySeconds * 1000);
        }
    } catch (error) {
        console.error("Error writing pending payment to cache:", error);
        // Secondary fallback write to in-memory map
        fallbackMap.set(key, value);
    }
};

/**
 * Retrieve cached pending payment transaction details
 * @param {string} key - Unique checkout session key
 * @returns {Promise<object|null>} - Session metadata or null if expired/not found
 */
const getPendingPayment = async (key) => {
    try {
        if (isRedisActive()) {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } else {
            return fallbackMap.get(key) || null;
        }
    } catch (error) {
        console.error("Error reading pending payment from cache:", error);
        return fallbackMap.get(key) || null;
    }
};

/**
 * Evict pending payment transaction details from cache
 * @param {string} key - Unique checkout session key
 */
const deletePendingPayment = async (key) => {
    try {
        if (isRedisActive()) {
            await redisClient.del(key);
        } else {
            fallbackMap.delete(key);
        }
    } catch (error) {
        console.error("Error evicting pending payment from cache:", error);
        fallbackMap.delete(key);
    }
};

module.exports = {
    setPendingPayment,
    getPendingPayment,
    deletePendingPayment
};
