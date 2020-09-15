import { getLatestTag } from '@prisma/fetch-engine'
import { getGenerator, IntrospectionEngine } from '@prisma/sdk'
import fs from 'fs-jetpack'
import { FSJetpack } from 'fs-jetpack/types'
import * as Path from 'path'
import pkgup from 'pkg-up'

/**
 * A potentially async value
 */
type MaybePromise<T> = Promise<T> | T

type SideEffector<Args extends Array<any>> = (
  ...args: Args
) => Promise<any> | any

process.env.SKIP_GENERATE = 'true'

const pkgDir = pkgup.sync() || __dirname
const engine = new IntrospectionEngine()

type Scenario = {
  /**
   * Only run this test case (and any others with only set).
   */
  only?: boolean
  /**
   * Do not run this test case.
   */
  todo?: boolean
  /**
   * Name of the test case. Influences the temp dir, snapshot, etc.
   */
  name: string
  up: string
  down: string
  do: (client: any) => Promise<any>
  expect: any
}

type Context = {
  fs: FSJetpack
}

/**
 * Integration test keyword arguments
 */
type Input<Client> = {
  /**
   * Settings to control things like test timeout and Prisma engine version.
   */
  settings?: {
    /**
     * How long each test case should have to run to completion.
     *
     * @default 10_000
     */
    timeout?: number
    /**
     * The version of Prisma Engine to use.
     *
     * @dynamicDefault The result of `@prisma/fetch-engine#getLatestTag`
     */
    engineVersion?: MaybePromise<string>
  }
  database: {
    /**
     * Name of the database being worked with.
     */
    name: string
    /**
     * Create a client connection to the database.
     */
    connect: (ctx: Context) => MaybePromise<Client>
    /**
     * At the beginning of _each_ test run logic to prepare the database
     */
    up: SideEffector<[client: Client, sql: string]>
    /**
     * At the end of _each_ tests run logic to bring down databases changes for test
     */
    down: SideEffector<[client: Client, sql: string]>
    /**
     * At the end of _all_ tests run logic to close the database connection.
     */
    close?: SideEffector<[client: Client]>
    /**
     * Construct a source snippet of the Prisma Schema file datasource for this database.
     */
    datasourceBlock: (ctx: Context) => string
  }
  scenarios: Scenario[]
}

export function integrationTest<Client>(input: Input<Client>) {
  type ScenarioState = {
    scenario: Scenario
    ctx: Context
    database: Input<Client>['database']
    db: Client
    prisma: any
  }

  let engineVersion
  const state: ScenarioState = {} as any

  beforeAll(async () => {
    fs.remove(getScenarioDir(input.database.name, ''))
    engineVersion = await (input.settings?.engineVersion
      ? input.settings.engineVersion
      : getLatestTag())
  })

  afterEach(async () => {
    // props might be missing if test errors out before they are set.
    if (state.db) {
      await input.database.down?.(state.db, state.scenario.down)
    }
    await state.prisma?.$disconnect()
  })

  afterAll(async () => {
    engine.stop()
    // props might be missing if test errors out before they are set.
    if (state.db) {
      await input.database.close?.(state.db)
    }
    fs.remove(getScenarioDir(input.database.name, ''))
  })

  /**
   * it.concurrent.each (https://jestjs.io/docs/en/api#testconcurrenteachtablename-fn-timeout)
   * does not seem to work. Snapshots keep getting errors. And each runs leads to different
   * snapshot errors. Might be related to https://github.com/facebook/jest/issues/2180 but we're
   * explicitly naming our snapshots here so...?
   *
   * If we ever make use of test.concurrent we will need to rethink our ctx system:
   * https://github.com/facebook/jest/issues/10513
   */
  it.each(prepareTestScenarios(input.scenarios))(
    `%s`,
    async (scenarioName, scenario) => {
      const ctx: Context = {} as any
      ctx.fs = fs.cwd(getScenarioDir(input.database.name, scenarioName))
      state.ctx = ctx
      state.scenario = scenario

      await ctx.fs.dirAsync('.')

      const dbClient = await input.database.connect(ctx)

      state.db = dbClient

      await input.database.up(dbClient, scenario.up)

      const schema = `
        generator client {
          provider = "prisma-client-js"
          output   = "${ctx.fs.path()}"
        }

        ${input.database.datasourceBlock(ctx)}
      `

      const introspectionResult = await engine.introspect(schema)
      const introspectionSchema = introspectionResult.datamodel

      await generate(
        ctx.fs.path('schema.prisma'),
        introspectionSchema,
        engineVersion,
      )

      const prismaClientPath = ctx.fs.path('index.js')
      const prismaClientDeclarationPath = ctx.fs.path('index.d.ts')

      expect(await fs.existsAsync(prismaClientPath)).toBeTruthy()
      expect(await fs.existsAsync(prismaClientDeclarationPath)).toBeTruthy()

      const { PrismaClient, prismaVersion } = await import(prismaClientPath)

      expect(prismaVersion.client).toMatch(/^2.+/)
      expect(prismaVersion.engine).toEqual(engineVersion)

      state.prisma = new PrismaClient()
      await state.prisma.$connect()

      const result = await scenario.do(state.prisma)

      expect(result).toEqual(scenario.expect)
      expect(maskSchema(introspectionSchema)).toMatchSnapshot(`datamodel`)
      expect(introspectionResult.warnings).toMatchSnapshot(`warnings`)
    },
    input.settings?.timeout ?? 10_000,
  )
}

function prepareTestScenarios(scenarios: Scenario[]): [string, Scenario][] {
  const onlys = scenarios.filter((scenario) => scenario.only)

  if (onlys.length) {
    return onlys.map((scenario) => [scenario.name, scenario])
  }

  return scenarios
    .filter((scenario) => scenario.todo !== true)
    .map((scenario) => [scenario.name, scenario])
}

function getScenarioDir(databaseName: string, scenarioName: string) {
  return Path.join(Path.dirname(pkgDir), databaseName, scenarioName)
}

async function generate(
  schemaPath: string,
  datamodel: string,
  engineVersion: string,
) {
  await fs.writeAsync(schemaPath, datamodel)

  const generator = await getGenerator({
    schemaPath,
    printDownloadProgress: false,
    baseDir: Path.dirname(schemaPath),
    version: engineVersion,
  })

  await generator.generate()

  generator.stop()
}

export function maskSchema(schema: string): string {
  const urlRegex = /url\s*=\s*.+/
  const outputRegex = /output\s*=\s*.+/
  return schema
    .split('\n')
    .map((line) => {
      const urlMatch = urlRegex.exec(line)
      if (urlMatch) {
        return `${line.slice(0, urlMatch.index)}url = "***"`
      }
      const outputMatch = outputRegex.exec(line)
      if (outputMatch) {
        return `${line.slice(0, outputMatch.index)}output = "***"`
      }
      return line
    })
    .join('\n')
}
