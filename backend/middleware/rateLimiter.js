const rateLimitStore = {};

// Clean up expired entries every 15 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    for (const ip in rateLimitStore) {
        rateLimitStore[ip] = rateLimitStore[ip].filter(timestamp => now - timestamp < windowMs);
        if (rateLimitStore[ip].length === 0) {
            delete rateLimitStore[ip];
        }
    }
}, 15 * 60 * 1000).unref();

const authRateLimiter = (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes window
    const maxRequests = 15; // Max 15 login/register attempts per IP within the window

    if (!rateLimitStore[ip]) {
        rateLimitStore[ip] = [];
    }

    // Filter out old timestamps outside the window
    rateLimitStore[ip] = rateLimitStore[ip].filter(timestamp => now - timestamp < windowMs);

    if (rateLimitStore[ip].length >= maxRequests) {
        return res.status(429).json({
            message: "Too many authentication attempts from this IP. Please try again after 15 minutes."
        });
    }

    rateLimitStore[ip].push(now);
    next();
};

module.exports = authRateLimiter;
