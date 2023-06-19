import { Sql } from 'sql-template-tag'

import { ITXClientDenyList } from '../../itxClientDenyList'
import { RequiredArgs as UserArgs } from '../extensions/$extends'
import { GetFindResult, GetResult as GetOperationResult, Operation } from './GetResult'
import { Payload } from './Payload'
import { PrismaPromise } from './Public'
import { Call, ComputeDeep, Fn, HasAllOptionalKeys, Optional, Path, Return, UnwrapTuple } from './Utils'

/* eslint-disable prettier/prettier */

export type InternalArgs<
  Q = { [K in string]: { [K in string]: unknown } },
  R = { [K in string]: { [K in string]: unknown } },
  M = { [K in string]: { [K in string]: unknown } },
  C = { [K in string]: unknown },
> = {
  result: { [K in keyof R]: { [P in keyof R[K]]: () => R[K][P] } },
  query: { [K in keyof Q]: { [P in keyof Q[K]]: () => Q[K][P] } },
  model: { [K in keyof M]: { [P in keyof M[K]]: () => M[K][P] } },
  client: { [K in keyof C]: () => C[K] },
}

export type Args = InternalArgs

export type DefaultArgs = InternalArgs<{}, {}, {}, {}>

export type GetResult<Base extends Record<any, any>, R extends Args['result'][string], _R extends Args['result'][string] = Record<string, any> extends R ? {} : R> =
  { [K in keyof _R | keyof Base]: K extends keyof _R ? _R[K] extends (() => { compute: (...args: any) => infer C }) ? C : never : Base[K] }

export type GetSelect<Base extends Record<any, any>, R extends Args['result'][string], _R extends Args['result'][string] = Record<string, any> extends R ? {} : R> =
  { [K in keyof _R | keyof Base]?: K extends keyof _R ? boolean : Base[K] }

/** Query */

export type DynamicQueryExtensionArgs<Q_, TypeMap extends TypeMapDef> = {
  [K in keyof Q_]:
    K extends '$allOperations'
    ? (args: { model?: string, operation: string, args: any, query: (args: any) => PrismaPromise<any> }) => Promise<any>
    : K extends '$allModels'
      ? {
          [P in keyof Q_[K] | keyof TypeMap['model'][keyof TypeMap['model']] | '$allOperations']?:
            P extends '$allOperations'
            ? DynamicQueryExtensionCb<TypeMap, 'model', keyof TypeMap['model'], keyof TypeMap['model'][keyof TypeMap['model']]>
            : P extends keyof TypeMap['model'][keyof TypeMap['model']]
              ? DynamicQueryExtensionCb<TypeMap, 'model', keyof TypeMap['model'], P>
              : never
        }
      : K extends TypeMap['meta']['modelProps']
        ? {
            [P in keyof Q_[K] | keyof TypeMap['model'][ModelKey<TypeMap, K>] | '$allOperations']?:
              P extends '$allOperations'
              ? DynamicQueryExtensionCb<TypeMap, 'model', ModelKey<TypeMap, K>, keyof TypeMap['model'][ModelKey<TypeMap, K>]>
              : P extends keyof TypeMap['model'][ModelKey<TypeMap, K>]
                ? DynamicQueryExtensionCb<TypeMap, 'model', ModelKey<TypeMap, K>, P>
                : never
          }
      : K extends keyof TypeMap['other']
        ? DynamicQueryExtensionCb<[TypeMap], 0 /* hack to maintain type arity */, 'other', K>
        : never
}

type DynamicQueryExtensionCb<TypeMap extends TypeMapDef, _0 extends PropertyKey, _1 extends PropertyKey, _2 extends PropertyKey> =
  <A extends DynamicQueryExtensionCbArgs<TypeMap, _0, _1, _2>>(args: A) =>
    Promise<TypeMap[_0][_1][_2]['result']>

type DynamicQueryExtensionCbArgs<TypeMap extends TypeMapDef, _0 extends PropertyKey, _1 extends PropertyKey, _2 extends PropertyKey> =
  ( // we distribute over the union of models and operations to allow narrowing
    _1 extends unknown ? _2 extends unknown ? {
      args: DynamicQueryExtensionCbArgsArgs<TypeMap, _0, _1, _2>,
      model: _0 extends 0 ? undefined : _1,
      operation: _2,
    } : never : never
  ) & { // but we don't distribute for query so that the input types stay union
    query: (args: DynamicQueryExtensionCbArgsArgs<TypeMap, _0, _1, _2>) =>
      PrismaPromise<TypeMap[_0][_1][_2]['result']>
  }

type DynamicQueryExtensionCbArgsArgs<TypeMap extends TypeMapDef, _0 extends PropertyKey, _1 extends PropertyKey, _2 extends PropertyKey> =
  _2 extends '$queryRaw' | '$executeRaw'
  ? Sql // Override args type for raw queries
  : TypeMap[_0][_1][_2]['args']

/** Result */

export type DynamicResultExtensionArgs<R_, TypeMap extends TypeMapDef> = {
  [K in keyof R_]: {
    [P in keyof R_[K]]?: {
      needs?: DynamicResultExtensionNeeds<TypeMap, ModelKey<TypeMap, K>, R_[K][P]> 
      compute<D extends DynamicResultExtensionData<TypeMap, ModelKey<TypeMap, K>, Path<R_, [K, P]>>>(data: D): unknown
    }
  }
}

type DynamicResultExtensionNeeds<TypeMap extends TypeMapDef, M extends PropertyKey, S> = {
  [K in keyof S]: K extends keyof TypeMap['model'][M]['findFirstOrThrow']['payload']['scalars'] ? S[K] : never
} & {
  [N in keyof TypeMap['model'][M]['findFirstOrThrow']['payload']['scalars']]?: boolean
}

type DynamicResultExtensionData<TypeMap extends TypeMapDef, M extends PropertyKey, S> =
  GetFindResult<TypeMap['model'][M]['findFirstOrThrow']['payload'], { select: S }>

/** Model */

export type DynamicModelExtensionArgs<M_, TypeMap extends TypeMapDef, ExtArgs extends Record<string, any>> = {
  [K in keyof M_]:
    K extends '$allModels'
    ? & { [P in keyof M_[K]]?: unknown }
      & { [K: symbol]: {} }
    : K extends TypeMap['meta']['modelProps']
      ? & { [P in keyof M_[K]]?: unknown }
        & { [K: symbol]: { ctx: DynamicModelExtensionThis<TypeMap, ModelKey<TypeMap, K>, ExtArgs> & { name: ModelKey<TypeMap, K> } } }
      : never
}

type DynamicModelExtensionThis<TypeMap extends TypeMapDef, M extends PropertyKey, ExtArgs extends Record<string, any>> = {
  [P in keyof TypeMap['model'][M] | keyof ExtArgs['model'][Uncapitalize<M & string>]]:
    P extends Operation
    ? HasAllOptionalKeys<TypeMap['model'][M][P]['args']> extends 1
      ? <A extends TypeMap['model'][M][P]['args']>(args?: A) =>
          PrismaPromise<GetOperationResult<TypeMap['model'][M][P]['payload'], A, P>>
      : <A extends TypeMap['model'][M][P]['args']>(args: A) =>
          PrismaPromise<GetOperationResult<TypeMap['model'][M][P]['payload'], A, P>>
    : Return<ExtArgs['model'][Uncapitalize<M & string>][P]>
} & {
  [K: symbol]: { types: TypeMap['model'][M] }
}

/** Client */

export type DynamicClientExtensionArgs<C_, TypeMap extends TypeMapDef, TypeMapCb extends TypeMapCbDef, ExtArgs extends Record<string, any>> = {
  [P in keyof C_]: unknown
} & {
  [K: symbol]: { ctx: Optional<DynamicClientExtensionThis<TypeMap, TypeMapCb, ExtArgs>, ITXClientDenyList> }
}

export type DynamicClientExtensionThis<TypeMap extends TypeMapDef, TypeMapCb extends TypeMapCbDef, ExtArgs extends Record<string, any>> = {
  [P in keyof TypeMap['other'] | keyof TypeMap['model'] | keyof ExtArgs['client'] as Uncapitalize<P & string>]:
    P extends Operation
    ? <A extends TypeMap['other'][P]['args']>(...args: A extends any[] ? A : [A]) =>
      PrismaPromise<GetOperationResult<TypeMap['other'][P]['payload'], A, P>>
    : P extends keyof TypeMap['model']
      ? DynamicModelExtensionThis<TypeMap, P, ExtArgs>
      : Return<ExtArgs['client'][P]>
} & {
  $extends: ExtendsHook<'extends', TypeMapCb, ExtArgs>
  $transaction<R>(fn: (client: Omit<DynamicClientExtensionThis<TypeMap, TypeMapCb, ExtArgs>, ITXClientDenyList>, options?: { maxWait?: number, timeout?: number, isolationLevel?: string }) => Promise<R>): Promise<R>
  $transaction<P extends PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: string }): Promise<UnwrapTuple<P>>
  $disconnect(): Promise<void>
  $connect(): Promise<void>
}

/** $extends, defineExtension */

export interface ExtendsHook<Variant extends 'extends' | 'define', TypeMapCb extends TypeMapCbDef, ExtArgs extends Record<string, any>, TypeMap extends TypeMapDef = Call<TypeMapCb, { extArgs: ExtArgs }>> {
  extArgs: ExtArgs,
  <
    // X_ seeds the first fields for auto-completion and deals with dynamic inference
    // X doesn't deal with dynamic inference but captures the final inferred input type
    Q_ extends { [K in TypeMap['meta']['modelProps'] | '$allModels' | keyof TypeMap['other'] | '$allOperations']?: unknown },
    R_ extends { [K in TypeMap['meta']['modelProps'] | '$allModels']?: unknown }, R,
    M_ extends { [K in TypeMap['meta']['modelProps'] | '$allModels']?: unknown }, M,
    C_ extends { [K in string]?: unknown }, C,
    Args extends InternalArgs = InternalArgs<{}, R, M, C>,
    MergedArgs extends InternalArgs = MergeExtArgs<TypeMap, ExtArgs, Args>
  >(extension:
    | ((client: DynamicClientExtensionThis<TypeMap, TypeMapCb, ExtArgs>) => { $extends: { extArgs: Args } })
    | {
        name?: string
        query?: DynamicQueryExtensionArgs<Q_, TypeMap>
        result?: DynamicResultExtensionArgs<R_, TypeMap> & R
        model?: DynamicModelExtensionArgs<M_, TypeMap, ExtArgs> & M
        client?: DynamicClientExtensionArgs<C_, TypeMap, TypeMapCb, ExtArgs> & C
      }
  ): {
    'extends': DynamicClientExtensionThis<Call<TypeMapCb, { extArgs: MergedArgs }>, TypeMapCb, MergedArgs>
    'define': (client: any) => { $extends: { extArgs: Args } }
  }[Variant]
}

type MergeExtArgs<TypeMap extends TypeMapDef, ExtArgs extends Record<any, any>, Args extends Record<any, any>> = 
  ComputeDeep<
    & ExtArgs
    & Args
    & AllModelsToStringIndex<TypeMap, Args, 'result'>
    & AllModelsToStringIndex<TypeMap, Args, 'model'>
  >

type AllModelsToStringIndex<TypeMap extends TypeMapDef, Args extends Record<string, any>, K extends PropertyKey> =
  Args extends { [P in K]: { $allModels: infer AllModels} }
  ? { [P in K]: Record<TypeMap['meta']['modelProps'], AllModels> }
  : {}

/** Shared */

type TypeMapDef = Record<any, any> /* DevTypeMapDef */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DevTypeMapDef = {
  meta: {
    modelProps: string
  },
  model: {
    [Model in PropertyKey]: {
      [Operation in PropertyKey]: DevTypeMapFnDef
    }
  },
  other: {
    [Operation in PropertyKey]: DevTypeMapFnDef
  }
}

type DevTypeMapFnDef = {
  args: any
  result: any
  payload: Payload
}

type TypeMapCbDef = Fn<{ extArgs: Args }, TypeMapDef>

type ModelKey<TypeMap extends TypeMapDef, M extends PropertyKey> =
  M extends keyof TypeMap['model']
  ? M & string
  : Capitalize<M & string>

export type { UserArgs }
