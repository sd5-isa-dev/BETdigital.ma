// lib/upstash/index.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = (
  requests: number = 10,
  seconds: `${number} s` = "10 s",
) =>
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, seconds),
  });