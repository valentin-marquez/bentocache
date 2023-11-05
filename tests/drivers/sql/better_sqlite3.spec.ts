import { test } from '@japa/runner'

import { Sql } from '../../../src/drivers/sql.js'
import { registerCacheDriverTestSuite } from '../../../test_helpers/driver_test_suite.js'

registerCacheDriverTestSuite({
  name: 'better-sqlite3',
  test,
  driver: Sql,
  supportsMilliseconds: true,
  config: {
    dialect: 'better-sqlite3',
    prefix: 'japa',
    connection: { filename: 'cache.sqlite3' },
  },
})
