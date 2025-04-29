import {createClient} from 'redis'

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
})

redisClient.on('error', (err) => console.log('Redis Client Error', err))

const ischeck = await redisClient.connect()
if(ischeck) console.log("Redis connected successfully")
else console.log("Redis connection failed")

export default redisClient;