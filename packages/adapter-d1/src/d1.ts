import { D1Database, D1Result } from '@cloudflare/workers-types'
import {
  // Debug,
  DriverAdapter,
  err,
  ok,
  Query,
  Queryable,
  Result,
  ResultSet,
  Transaction,
  TransactionOptions,
} from '@prisma/driver-adapter-utils'

// import { Mutex } from 'async-mutex'
import { getColumnTypes } from './conversion'

// TODO? Env var works differently in D1 so `debug` does not work.
// const debug = Debug('prisma:driver-adapter:d1')

type PerformIOResult = D1Result
// type ExecIOResult = D1ExecResult

type StdClient = D1Database

// const LOCK_TAG = Symbol()

class D1Queryable<ClientT extends StdClient> implements Queryable {
  readonly provider = 'sqlite'

  // [LOCK_TAG] = new Mutex()

  constructor(protected readonly client: ClientT) {}

  /**
   * Execute a query given as SQL, interpolating the given parameters.
   */
  async queryRaw(query: Query): Promise<Result<ResultSet>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tag = '[js::query_raw]'
    // console.debug(`${tag} %O`, query)

    const ioResult = await this.performIO(query)

    return ioResult.map((data) => {
      const convertedData = this.convertData(data)
      // console.debug({ convertedData })
      return convertedData
    })
  }

  private convertData(ioResult: PerformIOResult): ResultSet {
    if (ioResult.results.length === 0) {
      return {
        columnNames: [],
        columnTypes: [],
        rows: [],
      }
    }

    const results = ioResult.results as Object[]
    const columnNames = Object.keys(results[0])
    const columnTypes = getColumnTypes(columnNames, results)
    const rows = this.mapD1ToRows(results)

    return {
      columnNames,
      // Note: without Object.values the array looks like
      // columnTypes: [ id: 128 ],
      // and errors with:
      // ✘ [ERROR] A hanging Promise was canceled. This happens when the worker runtime is waiting for a Promise from JavaScript to resolve, but has detected that the Promise cannot possibly ever resolve because all code and events related to the Promise's I/O context have already finished.
      columnTypes: Object.values(columnTypes),
      rows,
    }
  }

  private mapD1ToRows(results: any) {
    const rows: unknown[][] = []
    for (const row of results) {
      const entry = Object.keys(row).map((k) => row[k])
      rows.push(entry)
    }
    return rows
  }

  /**
   * Execute a query given as SQL, interpolating the given parameters and
   * returning the number of affected rows.
   * Note: Queryable expects a u64, but napi.rs only supports u32.
   */
  async executeRaw(query: Query): Promise<Result<number>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tag = '[js::execute_raw]'
    // console.debug(`${tag} %O`, query)

    return (await this.performIO(query)).map(({ meta }) => meta.rows_written ?? 0)
  }

  private async performIO(query: Query): Promise<Result<PerformIOResult>> {
    // const release = await this[LOCK_TAG].acquire()
    // console.debug({ query })

    try {
      // Hack for booleans, we must convert them to 0/1.
      // ✘ [ERROR] Error in performIO: Error: D1_TYPE_ERROR: Type 'boolean' not supported for value 'true'
      query.args = query.args.map((arg) => {
        if (arg === true) {
          return 1
        } else if (arg === false) {
          return 0
        }
        return arg
      })

      const result = await this.client
        .prepare(query.sql)
        .bind(...query.args)
        .all()

      // console.debug({ result })

      return ok(result)
    } catch (e) {
      const error = e as Error
      console.error('Error in performIO: %O', error)

      try {
        const errorAsJson = JSON.parse(error.message)
        // We only get the error message, not the error code.
        // "name":"Error","message":"D1_ERROR: UNIQUE constraint failed: User.email"
        // So we try to match some errors and use the generic error code as a fallback.
        // https://www.sqlite.org/rescode.html
        // 1 = The SQLITE_ERROR result code is a generic error code that is used when no other more specific error code is available.
        let extendedCode = 1
        if (errorAsJson.message.startsWith('D1_ERROR: UNIQUE constraint failed:')) {
          extendedCode = 2067
        } else if (errorAsJson.message.startsWith('D1_ERROR: FOREIGN KEY constraint failed')) {
          extendedCode = 787
        }

        return err({
          kind: 'Sqlite',
          extendedCode,
          message: errorAsJson.message,
        })
      } catch (e) {
        throw error
      }
    } finally {
      // release()
    }
  }
}

class D1Transaction extends D1Queryable<StdClient> implements Transaction {
  constructor(client: StdClient, readonly options: TransactionOptions) {
    super(client)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async commit(): Promise<Result<void>> {
    // console.debug(`[js::commit]`)

    return ok(undefined)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async rollback(): Promise<Result<void>> {
    // console.debug(`[js::rollback]`)

    return ok(undefined)
  }
}

export class PrismaD1 extends D1Queryable<StdClient> implements DriverAdapter {
  constructor(client: StdClient) {
    super(client)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async startTransaction(): Promise<Result<Transaction>> {
    const options: TransactionOptions = {
      // TODO: D1 does not support transactions.
      usePhantomQuery: true,
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tag = '[js::startTransaction]'
    // console.debug(`${tag} options: %O`, options)

    return ok(new D1Transaction(this.client, options))
  }
}
