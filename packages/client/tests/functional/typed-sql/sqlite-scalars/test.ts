// @ts-ignore
import type { Prisma as PrismaNamespace, PrismaClient } from '@prisma/client'
// @ts-ignore
import * as Sql from '@prisma/client/sql'
import { expectTypeOf } from 'expect-type'

import testMatrix from './_matrix'

declare let prisma: PrismaClient
declare let Prisma: typeof PrismaNamespace
declare let sql: typeof Sql

const id = '1234'
const bigInt = BigInt('12345')
const dateTime = new Date('2024-07-31T14:37:36.570Z')
const bytes = Uint8Array.of(1, 2, 3)
testMatrix.setupTestSuite(
  () => {
    beforeAll(async () => {
      await prisma.testModel.create({
        data: {
          id,
          int: 123,
          double: 12.3,
          bool: true,
          string: 'hello',
          bigInt,
          dateTime,
          bytes,
          decimal: new Prisma.Decimal('12.34'),
        },
      })
    })
    test('int - output', async () => {
      const result = await prisma.$queryRawTyped(sql.getInt(id))
      expect(result[0].int).toBe(123)
      expectTypeOf(result[0].int).toBeNumber()
    })

    test('int - input', async () => {
      const result = await prisma.$queryRawTyped(sql.findInt(123))
      expect(result[0].id).toBe(id)
    })

    test('double - output', async () => {
      const result = await prisma.$queryRawTyped(sql.getDouble(id))
      expect(result[0].double).toBe(12.3)
      expectTypeOf(result[0].double).toBeNumber()
    })

    test('double - input', async () => {
      const result = await prisma.$queryRawTyped(sql.findDouble(13.1))
      expect(result[0].id).toBe(id)
    })

    test('string - output', async () => {
      const result = await prisma.$queryRawTyped(sql.getString(id))
      expect(result[0].string).toEqual('hello')
      expectTypeOf(result[0].string).toBeString()
    })

    test('string - input', async () => {
      const result = await prisma.$queryRawTyped(sql.findString('hello'))
      expect(result[0].id).toEqual(id)
    })

    test('BigInt - output', async () => {
      const result = await prisma.$queryRawTyped(sql.getBigInt(id))
      expect(result[0].bigInt).toEqual(bigInt)
      expectTypeOf(result[0].bigInt).toEqualTypeOf<bigint>()
    })

    test('BigInt - input', async () => {
      const numberResult = await prisma.$queryRawTyped(sql.findBigInt(12345))
      expect(numberResult[0].id).toEqual(id)

      const bigintResult = await prisma.$queryRawTyped(sql.findBigInt(bigInt))
      expect(bigintResult[0].id).toEqual(id)
    })

    test('DateTime - output', async () => {
      const result = await prisma.$queryRawTyped(sql.getDateTime(id))
      expect(result[0].dateTime).toEqual(dateTime)
      expectTypeOf(result[0].dateTime).toEqualTypeOf<Date>()
    })

    test('DateTime - input', async () => {
      const resultDate = await prisma.$queryRawTyped(sql.findDateTime(dateTime))
      expect(resultDate[0].id).toEqual(id)
    })

    test('Decimal - output', async () => {
      const result = await prisma.$queryRawTyped(sql.getDecimal(id))
      expect(result[0].decimal).toBeInstanceOf(Prisma.Decimal)
      expect(result[0].decimal).toEqual(new Prisma.Decimal('12.34'))
      expectTypeOf(result[0].decimal).toEqualTypeOf<PrismaNamespace.Decimal>()
    })

    test('Decimal - input', async () => {
      const resultDecimal = await prisma.$queryRawTyped(sql.findDecimal(new Prisma.Decimal('12.34')))
      expect(resultDecimal[0].id).toBe(id)

      const resultNumber = await prisma.$queryRawTyped(sql.findDecimal(12.34))
      expect(resultNumber[0].id).toBe(id)
    })

    test('bytes - output', async () => {
      const result = await prisma.$queryRawTyped(sql.getBytes(id))
      expect(result[0].bytes).toEqual(bytes)
      expectTypeOf(result[0].bytes).toEqualTypeOf<Uint8Array>()
    })

    test('bytes - input', async () => {
      const result = await prisma.$queryRawTyped(sql.findBytes(bytes))
      expect(result[0].id).toEqual(id)
    })
  },
  {
    optOut: {
      from: ['postgresql', 'mongodb', 'cockroachdb', 'sqlserver', 'mysql'],
      reason: 'Focusing on sqlite only',
    },
    skipDriverAdapter: {
      from: ['js_d1'],
      reason: '--sql does not work on D1',
    },
  },
)