import testMatrix from './_matrix'
// @ts-ignore
import type { PrismaClient } from './node_modules/@prisma/client'

declare let prisma: PrismaClient

testMatrix.setupTestSuite(() => {
    const date1 = '2011-01-01T00:00:00Z';
    const date2 = '2022-02-02T00:00:00Z';
  beforeAll(async () => {
    await prisma.resource.create({
      data: { date: date1 },
    })
    await prisma.resource.create({
      data: { date: date2 },
    })
  })

  test('findUnique date with Promise.all', async () => {
    const result = await Promise.all([
      prisma.resource.findUnique({
        where: { date: '2011-01-01T00:00:00Z' },
        select: { date: true },
      }),
      prisma.resource.findUnique({
        where: { date: '2022-02-02T00:00:00Z' },
        select: { date: true },
      }),
    ])

    expect(result).toMatchObject([{ date: date1 }, { date: date2 }]);
  })

  test('findUnique date with $transaction([...])', async () => {
    const result = await prisma.$transaction([
      prisma.resource.findUnique({
        where: { date: '2011-01-01T00:00:00Z' },
        select: { date: true },
      }),
      prisma.resource.findUnique({
        where: { date: '2022-02-02T00:00:00Z' },
        select: { date: true },
      }),
    ])

    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          date: 2011-01-01T00:00:00.000Z,
        },
        Object {
          date: 2022-02-02T00:00:00.000Z,
        },
      ]
    `)
  })

  test('findFirst date with Promise.all', async () => {
    const result = await Promise.all([
      prisma.resource.findFirst({
        where: { date: '2011-01-01T00:00:00Z' },
        select: { date: true },
      }),
      prisma.resource.findFirst({
        where: { date: '2022-02-02T00:00:00Z' },
        select: { date: true },
      }),
    ])

    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          date: 2011-01-01T00:00:00.000Z,
        },
        Object {
          date: 2022-02-02T00:00:00.000Z,
        },
      ]
    `)
  })

  test('findFirst date with $transaction([...])', async () => {
    const result = await prisma.$transaction([
      prisma.resource.findFirst({
        where: { date: '2011-01-01T00:00:00Z' },
        select: { date: true },
      }),
      prisma.resource.findFirst({
        where: { date: '2022-02-02T00:00:00Z' },
        select: { date: true },
      }),
    ])

    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          date: 2011-01-01T00:00:00.000Z,
        },
        Object {
          date: 2022-02-02T00:00:00.000Z,
        },
      ]
    `)
  })
})
