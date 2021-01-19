import { getTestClient } from '../../../../utils/getTestClient'

describe('connection-limit-mysql', () => {
  expect.assertions(2)
  const clients: any[] = []

  afterAll(async () => {
    await Promise.all(clients.map((c) => c.$disconnect()))
  })

  test('the client cannot query the db with 152 connections already open', async () => {
    const PrismaClient = await getTestClient()
    const connectionString =
      process.env.TEST_MYSQL_ISOLATED_URI ||
      'mysql://root:root@mysql:3306/tests'

    for (let i = 0; i <= 155; i++) {
      const client = new PrismaClient({
        datasources: {
          db: { url: connectionString },
        },
      })
      clients.push(client)
    }
    let count = 0
    try {
      for (const client of clients) {
        count++
        await client.$connect()
      }
    } catch (e) {
      expect(count).toEqual(153)
      expect(e.message).toMatchInlineSnapshot(
        `Error querying the database: Server error: \`ERROR HY000 (1040): Too many connections'`,
      )
    }
  }, 100_000)
})
