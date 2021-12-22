import { getClientEngineType } from '@prisma/sdk'
import path from 'path'
import { getTestClient } from '../../../../utils/getTestClient'
import { tearDownPostgres } from '../../../../utils/setupPostgres'
import { migrateDb } from '../../__helpers__/migrateDb'

beforeEach(async () => {
  process.env.TEST_POSTGRES_URI += '-logging-binary'
  await tearDownPostgres(process.env.TEST_POSTGRES_URI!)
  await migrateDb({
    connectionString: process.env.TEST_POSTGRES_URI!,
    schemaPath: path.join(__dirname, 'schema.prisma'),
  })
})

test('basic event logging - binary', async () => {
  if (getClientEngineType() !== 'binary') {
    return
  }

  const PrismaClient = await getTestClient()

  const prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'query',
      },
    ],
  })

  const onInfo = jest.fn()
  const onQuery = jest.fn()

  prisma.$on('info', onInfo)
  prisma.$on('query', onQuery)

  await prisma.user.findMany()

  prisma.$disconnect()

  if (typeof onQuery.mock.calls[0][0].duration === 'number') {
    onQuery.mock.calls[0][0].duration = 0
  }

  // jestSnapshotSerializer can't replace the serialized date. Additionally,
  // this allows us to check that the type is actually Date, otherwise the tests
  // would have passed with strings in the `timestamp` field, since those would
  // look identically in the snapshots.
  const replaceTimestamp = (fn: jest.Mock) => {
    for (const [event] of fn.mock.calls) {
      if (event.timestamp instanceof Date && !Number.isNaN(event.timestamp.valueOf())) {
        event.timestamp = new Date(0)
      }
    }
  }
  replaceTimestamp(onInfo)
  replaceTimestamp(onQuery)

  expect(onInfo.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        Object {
          message: Starting a postgresql pool with XX connections.,
          target: quaint::pooled,
          timestamp: 1970-01-01T00:00:00.000Z,
        },
      ],
      Array [
        Object {
          message: Started http server on http://127.0.0.1:00000,
          target: query_engine::server,
          timestamp: 1970-01-01T00:00:00.000Z,
        },
      ],
    ]
  `)

  expect(onQuery.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        Object {
          duration: 0,
          params: [0],
          query: SELECT "public"."User"."id" FROM "public"."User" WHERE 1=1 OFFSET $1,
          target: quaint::connector::metrics,
          timestamp: 1970-01-01T00:00:00.000Z,
        },
      ],
    ]
  `)
})
