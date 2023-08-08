import { test } from '@japa/runner'
import { setTimeout } from 'node:timers/promises'

import { CacheFactory } from '../../factories/cache_factory.js'
import { throwingFactory } from '../../test_helpers/index.js'

test.group('Cache | Stampede protection', () => {
  test('getOrSet() factory should be called only once', async ({ assert }) => {
    const { cache } = new CacheFactory().create()
    let factoryCalls = 0

    const factory = async () => {
      await setTimeout(100)
      factoryCalls++
      return 'value'
    }

    const results = await Promise.all([
      cache.getOrSet('key', factory),
      cache.getOrSet('key', factory),
    ])

    assert.deepEqual(results, ['value', 'value'])
    assert.equal(factoryCalls, 1)
  })

  test('getOrSetForever() factory should be called only once', async ({ assert }) => {
    const { cache } = new CacheFactory().create()
    let factoryCalls = 0

    const factory = async () => {
      await setTimeout(100)
      factoryCalls++
      return 'value'
    }

    const results = await Promise.all([
      cache.getOrSetForever('key', factory),
      cache.getOrSetForever('key', factory),
    ])

    assert.deepEqual(results, ['value', 'value'])
    assert.equal(factoryCalls, 1)
  })

  test('if factory throws an error it should release the lock', async ({ assert }) => {
    const { cache } = new CacheFactory().create()

    const results = await Promise.allSettled([
      cache.getOrSet('key', throwingFactory('foo')),
      cache.getOrSet('key', async () => {
        await setTimeout(100)
        return 'value'
      }),
    ])

    assert.deepEqual(results, [
      { status: 'rejected', reason: new Error('foo') },
      { status: 'fulfilled', value: 'value' },
    ])
  })

  test('high concurrency but only one factory call')
    .with([100, 1000, 10_000])
    .run(async ({ assert }, concurrency) => {
      const { cache } = new CacheFactory().create()
      let factoryCalls = 0

      const factory = async () => {
        await setTimeout(300)
        factoryCalls++
        return 'value'
      }

      const results = await Promise.all(
        Array.from({ length: concurrency }).map(() => cache.getOrSet('key', factory))
      )

      assert.deepEqual(results, Array.from({ length: concurrency }).fill('value'))
      assert.equal(factoryCalls, 1)
    })
})