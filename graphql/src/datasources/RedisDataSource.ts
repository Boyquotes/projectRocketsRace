import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis, {RedisOptions} from 'ioredis';

export default class RedisDataSource {
    private static instance: RedisDataSource;
    private pubsub: RedisPubSub;
    private redis: Redis

    static getInstance(connection: RedisOptions): RedisDataSource {
        if (!RedisDataSource.instance) {
            RedisDataSource.instance = new RedisDataSource(connection);
        }
        return this.instance
    }

    constructor(connection: RedisOptions) {
        console.log('INIT REDIS CONNECTION 🔄')
        this.redis = new Redis(connection);
        this.pubsub = new RedisPubSub({
            publisher: new Redis(connection),
            subscriber: new Redis(connection)
        });
        console.log('REDIS CONNECTION OK ✅')
    }

    setJSON(key: string, value: any, expiration?: number): void {
        if(expiration) {
            this.redis.set(key, JSON.stringify(value), 'EX', expiration)
            return
        }
        this.redis.set(key, JSON.stringify(value))
    }

    getJSON(key: string): Promise<any> {
        return this.redis.get(key).then(value => JSON.parse(value))
    }

    set(key: string, value: string, expiration?: number): void {
        if(expiration) {
            this.redis.set(key, value, 'EX', expiration)
            return
        }
        this.redis.set(key, value)
    }

    get(key: string): Promise<string> {
        return this.redis.get(key);
    }

    // subscribeMap(topic: string, mapper: Function) {
    //
    // }
    async getdel(key: string) : Promise<string>{
        const value = await this.redis.get(key)
        this.redis.del(key);


        return value
    }


    subscribe(topic: string) {
        return this.pubsub.asyncIterator(topic);
    }

    publish(topic: string, message: any) {
        console.log('PUBLISH', topic, message)
        this.pubsub.publish(topic, message)
    }

    async getAllRaces() {
        // Get all keys that match the race pattern
        const keys = await this.redis.keys('race:*');
        
        if (keys.length === 0) {
            return [];
        }

        // Get all race data
        const races = await Promise.all(
            keys.map(async (key) => {
                const raceData = await this.redis.get(key);
                return raceData ? JSON.parse(raceData) : null;
            })
        );

        // Filter out any null values and return valid races
        return races.filter(race => race !== null);
    }
    
}
