import path from 'path'

import { getTestClient } from '../../../../utils/getTestClient'
import { tearDownMysql } from '../../../../utils/setupMysql'
import { migrateDb } from '../../__helpers__/migrateDb'

// We WANT to be able to do the async function without an await
/* eslint-disable @typescript-eslint/require-await */

beforeAll(async () => {
  process.env.DATABASE_URL = process.env.TEST_MYSQL_URI!.replace('tests', 'tests-wrong-native-types')
  await tearDownMysql(process.env.DATABASE_URL)
  await migrateDb({
    schemaPath: path.join(__dirname, 'schema.prisma'),
  })
})

test('wrong-native-types-mysql A: Int, SmallInt, TinyInt, MediumInt, BigInt', async () => {
  const PrismaClient = await getTestClient()

  const prisma = new PrismaClient({ errorFormat: 'minimal' })

  await prisma.a.deleteMany()

  const data = {
    int: 123,
    sInt: 12,
    tInt: 1,
    mInt: 100,
    bInt: 123123123.1,
  }

  await expect(async () =>
    prisma.a.create({
      data,
      select: {
        int: true,
        sInt: true,
        mInt: true,
        bInt: true,
        tInt: true,
      },
    })
  ).rejects.toThrowErrorMatchingInlineSnapshot(`

    Invalid \`prisma.a.create()\` invocation:

    {
      data: {
        int: 123,
        sInt: 12,
        tInt: 1,
              ~
        mInt: 100,
        bInt: 123123123.1
      },
      select: {
        int: true,
        sInt: true,
        mInt: true,
        bInt: true,
        tInt: true
      }
    }

    Argument \`tInt\`: Invalid value provided. Expected Boolean, provided Int.
  `)

  await prisma.$disconnect()
})

test('wrong-native-types-mysql B: Float, Double, Decimal, Numeric', async () => {
  const PrismaClient = await getTestClient()

  const prisma = new PrismaClient({ errorFormat: 'minimal' })

  await prisma.b.deleteMany()

  const data: any = {
    float: 12.2,
    dFloat: 10.2,
    decFloat: 1.1,
    numFloat: 'a5.6',
  }

  await expect(async () =>
    prisma.b.create({
      data,
      select: {
        float: true,
        dFloat: true,
        decFloat: true,
        numFloat: true,
      },
    })
  ).rejects.toThrowErrorMatchingInlineSnapshot(`

    Invalid \`prisma.b.create()\` invocation:

    {
      data: {
        float: 12.2,
        dFloat: 10.2,
        decFloat: 1.1,
        numFloat: "a5.6"
                  ~~~~~~
      },
      select: {
        float: true,
        dFloat: true,
        decFloat: true,
        numFloat: true
      }
    }

    Invalid value for argument \`numFloat\`: invalid digit found in string. Expected decimal String.
  `)

  await prisma.$disconnect()
})

test('wrong-native-types-mysql C: Char, VarChar, TinyText, Text, MediumText, LongText', async () => {
  const PrismaClient = await getTestClient()

  const prisma = new PrismaClient({ errorFormat: 'minimal' })

  await prisma.c.deleteMany()

  const data = {
    char: 'f0f0f0f0f20',
    vChar: '123456789012',
    tText: 'f'.repeat(258),
    text: 'l'.repeat(70_000),
    mText: '🥳'.repeat(70_000),
    lText: '🔥'.repeat(80_000),
  }

  await expect(async () =>
    prisma.c.create({
      data,
      select: {
        char: true,
        vChar: true,
        tText: true,
        mText: true,
        text: true,
        lText: true,
      },
    })
  ).rejects.toThrowErrorMatchingInlineSnapshot(`

              Invalid \`prisma.c.create()\` invocation:


              The provided value for the column is too long for the column's type. Column: char
          `)

  await prisma.$disconnect()
})

test('wrong-native-types-mysql D: Date, Time, DateTime, Timestamp, Year', async () => {
  const PrismaClient = await getTestClient()

  const prisma = new PrismaClient({ errorFormat: 'minimal' })

  await prisma.d.deleteMany()

  const data = {
    date: new Date('2020-05-05T16:28:33.983Z'),
    time: new Date('2020-05-02T16:28:33.983Z'),
    dtime: new Date('2020-05-02T16:28:33.983Z'),
    ts: '2020-05-05T16:28:33.983+03:0012312',
    year: 'string',
  }

  await expect(async () =>
    prisma.d.create({
      data,
      select: {
        date: true,
        time: true,
        dtime: true,
        ts: true,
        year: true,
      },
    })
  ).rejects.toThrowErrorMatchingInlineSnapshot(`

    Invalid \`prisma.d.create()\` invocation:

    {
      data: {
        date: new Date("2020-05-05T16:28:33.983Z"),
        time: new Date("2020-05-02T16:28:33.983Z"),
        dtime: new Date("2020-05-02T16:28:33.983Z"),
        ts: "2020-05-05T16:28:33.983+03:0012312",
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        year: "string"
      },
      select: {
        date: true,
        time: true,
        dtime: true,
        ts: true,
        year: true
      }
    }

    Invalid value for argument \`ts\`: trailing input. Expected ISO-8601 DateTime.
  `)

  await prisma.$disconnect()
})

test('wrong-native-types-mysql E: Bit, Binary, VarBinary, Blob, TinyBlob, MediumBlob, LongBlob', async () => {
  const PrismaClient = await getTestClient()

  const prisma = new PrismaClient({ errorFormat: 'minimal' })

  await prisma.e.deleteMany()

  const data = {
    bit: [0x62],
    bin: '1234',
    vBin: '12345',
    blob: 'hi',
    tBlob: 'tbob',
    mBlob: 'mbob',
    lBlob: 'longbob',
  }

  await expect(async () =>
    prisma.e.create({
      data,
      select: {
        bit: true,
        bin: true,
        vBin: true,
        blob: true,
        tBlob: true,
        mBlob: true,
        lBlob: true,
      },
    })
  ).rejects.toThrowErrorMatchingInlineSnapshot(`

    Invalid \`prisma.e.create()\` invocation:

    {
      data: {
        bit: [
          98
        ],
        ~~~~
        bin: "1234",
        vBin: "12345",
        blob: "hi",
        tBlob: "tbob",
        mBlob: "mbob",
        lBlob: "longbob"
      },
      select: {
        bit: true,
        bin: true,
        vBin: true,
        blob: true,
        tBlob: true,
        mBlob: true,
        lBlob: true
      }
    }

    Argument \`bit\`: Invalid value provided. Expected Bytes, provided (Int).
  `)

  await prisma.$disconnect()
})
