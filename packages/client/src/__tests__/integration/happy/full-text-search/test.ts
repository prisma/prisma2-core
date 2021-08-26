import path from 'path'
import { generateTestClient } from '../../../../utils/getTestClient'
import { tearDownPostgres } from '../../../../utils/setupPostgres'
import { migrateDb } from '../../__helpers__/migrateDb'

// @ts-ignore trick to get typings at dev time
import type { PrismaClient } from './node_modules/@prisma/client'

let prisma: PrismaClient
const baseUri = process.env.TEST_POSTGRES_URI
describe('full-text-search (postgres)', () => {
  beforeAll(async () => {
    process.env.TEST_POSTGRES_URI += '-full-text-search'
    await tearDownPostgres(process.env.TEST_POSTGRES_URI!)
    await migrateDb({
      connectionString: process.env.TEST_POSTGRES_URI!,
      schemaPath: path.join(__dirname, 'schema.prisma'),
    })
    await generateTestClient(__dirname)
    const { PrismaClient } = await require('./node_modules/@prisma/client')

    prisma = new PrismaClient()

    await prisma.user.create({
      data: {
        email: 'email1@email.io',
        name: '0 1 2 3 4 5 6 7 8',
      },
    })

    await prisma.user.create({
      data: {
        email: 'email2@email.io',
        name: '0 2 4 6 8',
      },
    })

    await prisma.user.create({
      data: {
        email: 'email3@email.io',
        name: '1 3 5 7 9',
      },
    })
  })

  afterAll(async () => {
    await prisma.user.deleteMany()
    await prisma.$disconnect()
    process.env.TEST_POSTGRES_URI = baseUri
  })

  /**
   * Test search with the `&` operator
   */
  test('findMany with &', async () => {
    const result = await prisma.user.findMany({
      where: {
        name: {
          search: '1 & 2',
        },
      },
    })

    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    email: email1@email.io,
    id: 1,
    name: 0 1 2 3 4 5 6 7 8,
  },
]
`)
  })

  /**
   * Test search with the `|` operator
   */
  test('findMany with |', async () => {
    const result = await prisma.user.findMany({
      where: {
        name: {
          search: '1 | 2',
        },
      },
    })

    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    email: email1@email.io,
    id: 1,
    name: 0 1 2 3 4 5 6 7 8,
  },
  Object {
    email: email2@email.io,
    id: 2,
    name: 0 2 4 6 8,
  },
  Object {
    email: email3@email.io,
    id: 3,
    name: 1 3 5 7 9,
  },
]
`)
  })

  /**
   * Test search with the `<->` operator
   */
  test('findMany with <->', async () => {
    const result = await prisma.user.findMany({
      where: {
        name: {
          search: '4 <-> 5',
        },
      },
    })

    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    email: email1@email.io,
    id: 1,
    name: 0 1 2 3 4 5 6 7 8,
  },
]
`)
  })

  /**
   * Test search with the `|` + `&` operators
   */
  test('findMany with & and |', async () => {
    const result = await prisma.user.findMany({
      where: {
        name: {
          search: '(0 | 1) & (2 | 3)',
        },
      },
    })

    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    email: email1@email.io,
    id: 1,
    name: 0 1 2 3 4 5 6 7 8,
  },
  Object {
    email: email2@email.io,
    id: 2,
    name: 0 2 4 6 8,
  },
  Object {
    email: email3@email.io,
    id: 3,
    name: 1 3 5 7 9,
  },
]
`)
  })

  /**
   * Test search with the `!` operator
   */
  test('findMany with !', async () => {
    const result = await prisma.user.findMany({
      where: {
        name: {
          search: '0 & !1',
        },
      },
    })

    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    email: email2@email.io,
    id: 2,
    name: 0 2 4 6 8,
  },
]
`)
  })

  /**
   * Get an array of empty results
   */
  test('no results', async () => {
    const result = await prisma.user.findMany({
      where: {
        name: {
          search: '!0 & !1',
        },
      },
    })

    expect(result).toMatchInlineSnapshot(`Array []`)
  })

  /**
   * Use an invalid operator
   */
  test('bad operator', async () => {
    const result = prisma.user.findMany({
      where: {
        name: {
          search: '0 1',
        },
      },
    })

    await expect(result).rejects.toThrowErrorMatchingInlineSnapshot(`

Invalid \`prisma.user.findMany()\` invocation:


  Error occurred during query execution:
ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(Error { kind: Db, cause: Some(DbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState("42601"), message: "syntax error in tsquery: \\"0 1\\"", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tsquery.c"), line: Some(514), routine: Some("makepol") }) }) })
`)
  })
})
