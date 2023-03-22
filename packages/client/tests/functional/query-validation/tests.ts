import testMatrix from './_matrix'
// @ts-ignore
import type { PrismaClient } from './node_modules/@prisma/client'

declare let prisma: PrismaClient

testMatrix.setupTestSuite((suiteConfig, suiteMeta) => {
  test('include and select are used at the same point', async () => {
    const result = prisma.user.findMany({
      select: {},
      // @ts-expect-error
      include: {},
    })

    await expect(result).rejects.toMatchPrismaErrorInlineSnapshot(`

      Invalid \`prisma.user.findMany()\` invocation in
      /client/tests/functional/query-validation/tests.ts:0:0

        XX 
        XX testMatrix.setupTestSuite((suiteConfig, suiteMeta) => {
        XX   test('include and select are used at the same point', async () => {
      → XX     const result = prisma.user.findMany({
                select: {},
                ~~~~~~
                include: {}
                ~~~~~~~
              })

      Please either use \`include\` or \`select\`, but not both at the same time.
    `)
  })

  test('include used on scalar field', async () => {
    const result = prisma.user.findMany({
      // @ts-expect-error
      include: { id: true },
    })

    await expect(result).rejects.toMatchPrismaErrorInlineSnapshot(`

      Invalid \`prisma.user.findMany()\` invocation in
      /client/tests/functional/query-validation/tests.ts:0:0

        XX })
        XX 
        XX test('include used on scalar field', async () => {
      → XX   const result = prisma.user.findMany({
               include: {
                 id: true
                 ~~
               }
             })

      Invalid scalar field \`id\` for include statement on model User. Available options are listed in green.
      Note, that include statements only accept relation fields.
    `)
  })

  test('unknown selection field', async () => {
    const result = prisma.user.findMany({
      select: {
        // @ts-expect-error
        notThere: true,
      },
    })

    await expect(result).rejects.toMatchPrismaErrorInlineSnapshot(`

      Invalid \`prisma.user.findMany()\` invocation in
      /client/tests/functional/query-validation/tests.ts:0:0

        XX })
        XX 
        XX test('unknown selection field', async () => {
      → XX   const result = prisma.user.findMany({
               select: {
                 notThere: true,
                 ~~~~~~~~
             ?   id?: true,
             ?   email?: true,
             ?   name?: true,
             ?   createdAt?: true,
             ?   published?: true
               }
             })

      Unknown field \`notThere\` for select statement on model User. Available options are listed in green.
    `)
  })

  test('empty selection', async () => {
    const result = prisma.user.findMany({
      select: {},
    })

    await expect(result).rejects.toMatchPrismaErrorInlineSnapshot(`

      Invalid \`prisma.user.findMany()\` invocation in
      /client/tests/functional/query-validation/tests.ts:0:0

        XX })
        XX 
        XX test('empty selection', async () => {
      → XX   const result = prisma.user.findMany({
               select: {
             ?   id?: true,
             ?   email?: true,
             ?   name?: true,
             ?   createdAt?: true,
             ?   published?: true
               }
             })

      The \`select\` statement for type User must not be empty. Available options are listed in green.
    `)
  })

  test('unknown argument', async () => {
    const result = prisma.user.findMany({
      // @ts-expect-error
      notAnArgument: 123,
    })

    await expect(result).rejects.toMatchPrismaErrorInlineSnapshot(`

      Invalid \`prisma.user.findMany()\` invocation in
      /client/tests/functional/query-validation/tests.ts:0:0

        XX })
        XX 
        XX test('unknown argument', async () => {
      → XX   const result = prisma.user.findMany({
               notAnArgument: 123,
               ~~~~~~~~~~~~~
             ? where?: UserWhereInput,
             ? orderBy?: UserOrderByWithRelationInput[] | UserOrderByWithRelationInput,
             ? cursor?: UserWhereUniqueInput,
             ? take?: Int,
             ? skip?: Int,
             ? distinct?: enum[]
             })

      Unknown argument notAnArgument. Available options are listed in green.
    `)
  })

  test('unknown object field', async () => {
    const result = prisma.user.findMany({
      where: {
        // @ts-expect-error
        notAValidField: 123,
      },
    })

    await expect(result).rejects.toMatchPrismaErrorInlineSnapshot(`

      Invalid \`prisma.user.findMany()\` invocation in
      /client/tests/functional/query-validation/tests.ts:0:0

        XX })
        XX 
        XX test('unknown object field', async () => {
      → XX   const result = prisma.user.findMany({
               where: {
                 notAValidField: 123,
                 ~~~~~~~~~~~~~~
             ?   AND?: UserWhereInput | UserWhereInput[],
             ?   OR?: UserWhereInput[],
             ?   NOT?: UserWhereInput | UserWhereInput[],
             ?   id?: StringFilter | String,
             ?   email?: StringFilter | String,
             ?   name?: StringFilter | String,
             ?   createdAt?: DateTimeFilter | DateTime,
             ?   published?: BoolFilter | Boolean
               }
             })

      Unknown argument notAValidField. Available options are listed in green.
    `)
  })

  test('missing required argument', async () => {
    // @ts-expect-error
    const result = prisma.user.findUnique({})

    await expect(result).rejects.toMatchPrismaErrorInlineSnapshot(`

      Invalid \`prisma.user.findUnique()\` invocation in
      /client/tests/functional/query-validation/tests.ts:0:0

        XX 
        XX test('missing required argument', async () => {
        XX   // @ts-expect-error
      → XX   const result = prisma.user.findUnique({
             + where: {
             +   id: String,
             +   email: String
             + }
             })

      Argument where is missing.
    `)
  })

  test('invalid argument type', async () => {
    const result = prisma.user.findUnique({
      where: {
        // @ts-expect-error
        email: 123,
      },
    })

    await expect(result).rejects.toMatchPrismaErrorInlineSnapshot(`

      Invalid \`prisma.user.findUnique()\` invocation in
      /client/tests/functional/query-validation/tests.ts:0:0

        XX })
        XX 
        XX test('invalid argument type', async () => {
      → XX   const result = prisma.user.findUnique({
               where: {
                 email: 123
                        ~~~
               }
             })

      Argument email: Invalid value provided. Expected String, provided Int.
    `)
  })

  test('union error', async () => {
    const result = prisma.user.findMany({
      where: {
        // @ts-expect-error
        email: 123,
      },
    })

    await expect(result).rejects.toMatchPrismaErrorInlineSnapshot(`

      Invalid \`prisma.user.findMany()\` invocation in
      /client/tests/functional/query-validation/tests.ts:0:0

        XX })
        XX 
        XX test('union error', async () => {
      → XX   const result = prisma.user.findMany({
               where: {
                 email: 123
                        ~~~
               }
             })

      Argument email: Invalid value provided. Expected StringFilter or String, provided Int.
    `)
  })

  test('union error: different paths', async () => {
    const result = prisma.user.findMany({
      where: {
        // @ts-expect-error
        email: { gt: 123 },
      },
    })

    await expect(result).rejects.toMatchPrismaErrorInlineSnapshot(`

      Invalid \`prisma.user.findMany()\` invocation in
      /client/tests/functional/query-validation/tests.ts:0:0

        XX })
        XX 
        XX test('union error: different paths', async () => {
      → XX   const result = prisma.user.findMany({
               where: {
                 email: {
                   gt: 123
                       ~~~
                 }
               }
             })

      Argument gt: Invalid value provided. Expected String, provided Int.
    `)
  })

  test('invalid argument value', async () => {
    const result = prisma.user.findMany({
      where: {
        createdAt: { gt: 'yesterday' },
      },
    })

    await expect(result).rejects.toMatchPrismaErrorInlineSnapshot(`

      Invalid \`prisma.user.findMany()\` invocation in
      /client/tests/functional/query-validation/tests.ts:0:0

        XX })
        XX 
        XX test('invalid argument value', async () => {
      → XX   const result = prisma.user.findMany({
                where: {
                  createdAt: {
                    gt: "yesterday"
                        ~~~~~~~~~~~
                  }
                }
              })

      Invalid value for argument gt: input contains invalid characters. Expected ISO-8601 DateTime.
    `)
  })

  test('missing required field', async () => {
    const result = prisma.user.findUnique({ where: {} })

    await expect(result).rejects.toMatchPrismaErrorInlineSnapshot(`not implemented: SomeFieldsMissing`)
  })

  test('too many fields', async () => {
    const result = prisma.user.findUnique({ where: { id: '123', email: 'foo@bar.com' } })

    await expect(result).rejects.toMatchPrismaErrorInlineSnapshot(`not implemented: TooManyFieldsGiven`)
  })
})
