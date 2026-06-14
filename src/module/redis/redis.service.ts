import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis'

@Injectable()
export class RedisService {

    private readonly redis: Redis;

    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD,
            tls: {},
            
        })
    }

    async set(key: string, value: string, ttlSeconds?: number) {
        if (ttlSeconds) {
            await this.redis.set(
                key,
                value,
                'EX',
                ttlSeconds
            )
        } else {
            await this.redis.set(key, value);
        }
    }

    async get(key: string) {
        return await this.redis.get(key);
    }

    async delete(key: string) {
        return await this.redis.del(key);
    }

}
