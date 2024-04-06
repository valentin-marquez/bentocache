/**
 * Benchmark a single get operation on a redis store
 */
import 'dotenv/config'

import Keyv from 'keyv'
import { Redis } from 'ioredis'
import { Bench } from 'tinybench'
import { caching } from 'cache-manager'
import { redisStore } from 'cache-manager-ioredis-yet'

import { BentoCache } from '../index.js'
import { bentostore } from '../src/bento_store.js'
import { redisDriver } from '../src/drivers/redis.js'
import { REDIS_CREDENTIALS } from '../tests/helpers/index.js'

const bench = new Bench()

const bentocache = new BentoCache({
  default: 'redis',
  stores: {
    redis: bentostore().useL2Layer(redisDriver({ connection: REDIS_CREDENTIALS })),
  },
})

const keyv = new Keyv('redis://localhost:6379')

const cacheManager = await caching(await redisStore({ host: 'localhost', port: 6379 }))

await keyv.set('key', 'value')
await bentocache.set('key', 'value')
await cacheManager.set('key', 'value')

const ioredis = new Redis()

bench
  .add('ioredis', async () => {
    await ioredis.get('key')
  })
  .add('BentoCache', async () => {
    await bentocache.get('key')
  })
  .add('Keyv', async () => {
    await keyv.get('key')
  })
  .add('CacheManager', async () => {
    await cacheManager.get('key')
  })

await bench.run()
console.table(bench.table())

await Promise.all([
  bentocache.disconnectAll(),
  ioredis.quit(),
  cacheManager.store.client.disconnect(),
  keyv.disconnect(),
])
