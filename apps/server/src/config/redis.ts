import Redis from "ioredis";
import { env } from "./env";

const redis = new Redis(env.redisUrl);

redis.on("connect", () => console.log("✅ Redis on connect"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

export default redis;