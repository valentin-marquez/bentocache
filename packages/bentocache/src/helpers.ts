import string from '@poppinss/utils/string'

import type { Duration } from './types/main.js'
/**
 * Resolve a TTL value to a number in milliseconds
 */
export function resolveTtl(ttl?: Duration, defaultTtl: Duration = 30_000) {
  if (typeof ttl === 'number') return ttl

  /**
   * If the TTL is null, it means the value should never expire
   */
  if (ttl === null) {
    return undefined
  }

  if (ttl === undefined) {
    if (typeof defaultTtl === 'number') return defaultTtl
    if (typeof defaultTtl === 'string') return string.milliseconds.parse(defaultTtl)

    return undefined
  }

  return string.milliseconds.parse(ttl)
}

/**
 * Useful for creating a return value that can be destructured
 * or iterated over.
 *
 * See : https://antfu.me/posts/destructuring-with-object-or-array
 */
export function createIsomorphicDestructurable<
  T extends Record<string, unknown>,
  A extends readonly any[],
>(obj: T, arr: A): T & A {
  const clone = { ...obj }

  Object.defineProperty(clone, Symbol.iterator, {
    enumerable: false,
    value() {
      let index = 0
      return {
        next: () => ({
          value: arr[index++],
          done: index > arr.length,
        }),
      }
    },
  })

  return clone as T & A
}

/**
 * Checks if the given item is an object.
 *
 * @param item - The item to check.
 * @returns Returns `true` if the item is an object, `false` otherwise.
 */
export function isObject(item: { [x: string]: any }) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Recursively merges the properties of multiple objects into a single object.
 * @param target - The target object to merge the properties into.
 * @param sources - The source objects whose properties will be merged into the target object.
 * @returns The merged object.
 */
export function mergeDeep(target: { [x: string]: any }, ...sources: any[]) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}
