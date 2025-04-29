import redisClient from '../config/redis.js';

const WINDOW_IN_SECONDS = 60; // 1 minute
const MAX_REQUESTS = 10;

export async function rateLimiter(req, res, next) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized: User ID missing in token." });
        }

        const redisKey = `rate_limit:${req.user.id}`;
        const current = await redisClient.get(redisKey);

        if (current && parseInt(current) >= MAX_REQUESTS) {
            return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
        }

        const pipeline = redisClient.multi();
        pipeline.incr(redisKey);
        if (!current) {
            pipeline.expire(redisKey, WINDOW_IN_SECONDS);
        }
        await pipeline.exec();

        next();
    } catch (err) {
        console.error("Rate limiting error:", err);
        return res.status(500).json({ error: "Internal server error in rate limiter." });
    }
}
