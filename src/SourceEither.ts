/** @since 0.1.0 */
import { Alt2 } from 'fp-ts/Alt'
import { Applicative2 } from 'fp-ts/Applicative'
import { Apply2 } from 'fp-ts/Apply'
import { Bifunctor2 } from 'fp-ts/Bifunctor'
import * as E from 'fp-ts/Either'
import * as ET from 'fp-ts/EitherT'
import { flow, pipe, identity } from 'fp-ts/function'
import { Refinement } from 'fp-ts/Refinement'
import { Predicate } from 'fp-ts/Predicate'
import { bindTo as bindTo_, flap as flap_, Functor2 } from 'fp-ts/Functor'
import { bind as bind_, Chain2, chainFirst as chainFirst_ } from 'fp-ts/Chain'
import { IO } from 'fp-ts/IO'
import { IOEither } from 'fp-ts/IOEither'
import { Monad2 } from 'fp-ts/Monad'
import { MonadIO2 } from 'fp-ts/MonadIO'
import { MonadTask2 } from 'fp-ts/MonadTask'
import { MonadThrow2 } from 'fp-ts/MonadThrow'
import { Option } from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import * as Wonka from 'wonka'
import { MonadSource2 } from './MonadSource'
import * as S from './Source'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @since 0.1.0
 * @category Model
 */
export type SourceEither<E, A> = Wonka.Source<E.Either<E, A>>

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @since 0.1.0
 * @category Constructors
 */
export const left: <E = never, A = never>(e: E) => SourceEither<E, A> =
  /*#__PURE__*/
  ET.left(S.Monad)

/**
 * @since 0.1.0
 * @category Constructors
 */
export const right: <E = never, A = never>(a: A) => SourceEither<E, A> =
  /*#__PURE__*/
  ET.right(S.Monad)

/**
 * @since 0.1.0
 * @category Constructors
 */
export const rightSource: <E = never, A = never>(
  ma: Wonka.Source<A>
) => SourceEither<E, A> =
  /*#__PURE__*/
  S.map(E.right)

/**
 * @since 0.1.0
 * @category Constructors
 */
export const leftSource: <E = never, A = never>(
  ma: Wonka.Source<E>
) => SourceEither<E, A> =
  /*#__PURE__*/
  S.map(E.left)

/**
 * @since 0.1.0
 * @category Constructors
 */
export const fromIOEither: <E, A>(fa: IOEither<E, A>) => SourceEither<E, A> =
  S.fromIO

/**
 * @since 0.1.0
 * @category Constructors
 */
export const rightIO: <E = never, A = never>(ma: IO<A>) => SourceEither<E, A> =
  /*#__PURE__*/
  flow(S.fromIO, rightSource)

/**
 * @since 0.1.0
 * @category Constructors
 */
export const leftIO: <E = never, A = never>(me: IO<E>) => SourceEither<E, A> =
  /*#__PURE__*/
  flow(S.fromIO, leftSource)

/**
 * @since 0.1.0
 * @category Constructors
 */
export const fromTaskEither: <E, A>(
  t: TE.TaskEither<E, A>
) => SourceEither<E, A> = S.fromTask

/**
 * @since 0.1.0
 * @category Constructors
 */
export const fromIO: MonadIO2<URI>['fromIO'] = rightIO

/**
 * @since 0.1.0
 * @category Constructors
 */
export const fromTask: MonadTask2<URI>['fromTask'] =
  /*#__PURE__*/
  flow(S.fromTask, rightSource)

/**
 * @since 0.1.0
 * @category Constructors
 */
export const fromSource: MonadSource2<URI>['fromSource'] = rightSource

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @since 0.1.0
 * @category Destructors
 */
export const match: <E, A, B>(
  onLeft: (e: E) => Wonka.Source<B>,
  onRight: (a: A) => Wonka.Source<B>
) => (ma: SourceEither<E, A>) => Wonka.Source<B> =
  /*#__PURE__*/
  flow(E.fold, S.chain)

/**
 * Less strict version of [`match`](#match).
 *
 * @since 0.1.0
 * @category Destructors
 */
export const matchW: <E, B, A, C>(
  onLeft: (e: E) => Wonka.Source<B>,
  onRight: (a: A) => Wonka.Source<C>
) => (ma: SourceEither<E, A>) => Wonka.Source<B | C> = match as any

/**
 * @since 0.1.0
 * @category Destructors
 */
export const matchE: <E, A, B>(
  onLeft: (e: E) => Wonka.Source<B>,
  onRight: (a: A) => Wonka.Source<B>
) => (ma: SourceEither<E, A>) => Wonka.Source<B> =
  /*#__PURE__*/
  ET.matchE(S.Monad)

/**
 * Alias of [`matchE`](#matche).
 *
 * @since 0.1.0
 * @category Destructors
 */
export const fold = matchE

/**
 * Less strict version of [`matchE`](#matche).
 *
 * @since 0.1.0
 * @category Destructors
 */
export const matchEW: <E, B, A, C>(
  onLeft: (e: E) => Wonka.Source<B>,
  onRight: (a: A) => Wonka.Source<B>
) => (ma: SourceEither<E, A>) => Wonka.Source<B | C> = matchE as any

/**
 * Alias of [`matchW`](#matchW).
 *
 * @since 0.1.0
 * @category Destructors
 */
export const foldW = matchEW

/**
 * @since 0.1.0
 * @category Destructors
 */
export const getOrElse: <E, A>(
  onLeft: (e: E) => Wonka.Source<A>
) => (ma: SourceEither<E, A>) => Wonka.Source<A> = ET.getOrElse(S.Monad)

/**
 * Less strict version of [`getOrElse`](#getorelse).
 *
 * @since 0.1.0
 * @category Destructors
 */
export const getOrElseW: <E, B>(
  onLeft: (e: E) => Wonka.Source<B>
) => <A>(ma: SourceEither<E, A>) => Wonka.Source<A | B> = getOrElse as any

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @since 0.1.0
 * @category Combinators
 */
export const orElse: <E, A, M>(
  onLeft: (e: E) => SourceEither<M, A>
) => (ma: SourceEither<E, A>) => SourceEither<M, A> = ET.orElse(S.Monad)

/**
 * Less strict version of [`orElse`](#orelse).
 *
 * @since 0.1.0
 * @category Combinators
 */
export const orElseW: <E1, E2, B>(
  onLeft: (e: E1) => SourceEither<E2, B>
) => <A>(ma: SourceEither<E1, A>) => SourceEither<E2, A | B> = orElse as any

/**
 * @since 0.1.0
 * @category Combinators
 */
export const orElseFirst: <E, B>(
  onLeft: (e: E) => SourceEither<E, B>
) => <A>(ma: SourceEither<E, A>) => SourceEither<E, A> =
  /*#__PURE__*/
  ET.orElseFirst(S.Monad)

/**
 * @since 0.1.0
 * @category Combinators
 */
export const orElseFirstW: <E1, E2, B>(
  onLeft: (e: E1) => SourceEither<E2, B>
) => <A>(ma: SourceEither<E1, A>) => SourceEither<E1 | E2, A> =
  orElseFirst as any

/**
 * @since 0.1.0
 * @category Combinators
 */
export const orLeft: <E1, E2>(
  onLeft: (e: E1) => Wonka.Source<E2>
) => <A>(fa: SourceEither<E1, A>) => SourceEither<E2, A> =
  /*#__PURE__*/
  ET.orLeft(S.Monad)

/**
 * @since 0.1.0
 * @category Combinators
 */
export const swap: <E, A>(ma: SourceEither<E, A>) => SourceEither<A, E> =
  ET.swap(S.Functor)

// -------------------------------------------------------------------------------------
// type class members
// -------------------------------------------------------------------------------------

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>)
 * => F<B>` whose argument and return types use the type constructor `F` to
 * represent some computational context.
 *
 * @since 0.1.0
 * @category Functor
 */
export const map: <A, B>(
  f: (a: A) => B
) => <E>(fa: SourceEither<E, A>) => SourceEither<E, B> = ET.map(S.Functor)

/**
 * Apply a function to an argument under a type constructoS.
 *
 * @since 0.6.0
 * @category Apply
 */
export const ap = ET.ap(S.Apply)

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * Derivable from `Apply`.
 *
 * @since 0.1.0
 * @category Combinators
 */
export const apFirst: <E, B>(
  fb: SourceEither<E, B>
) => <A>(fa: SourceEither<E, A>) => SourceEither<E, A> = (fb) =>
  flow(
    map((a) => () => a),
    ap(fb)
  )

/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * Derivable from `Apply`.
 *
 * @since 0.1.0
 * @category Combinators
 */
export const apSecond = <E, B>(
  fb: SourceEither<E, B>
): (<A>(fa: SourceEither<E, A>) => SourceEither<E, B>) =>
  flow(
    map(() => (b: B) => b),
    ap(fb)
  )

/**
 * Identifies an associative operation on a type constructoS. It is similar to
 * `Semigroup`, except that it applies to types of kind `* -> *`.
 *
 * @since 0.1.0
 * @category Alt
 */
export const alt = ET.alt(S.Monad)

/**
 * @since 0.1.0
 * @category Bifunctor
 */
export const bimap: <E, G, A, B>(
  f: (e: E) => G,
  g: (a: A) => B
) => (fa: SourceEither<E, A>) => SourceEither<G, B> = ET.bimap(S.Functor)

/**
 * @since 0.1.0
 * @category Bifunctor
 */
export const mapLeft: <E, G>(
  f: (e: E) => G
) => <A>(fa: SourceEither<E, A>) => SourceEither<G, A> = ET.mapLeft(S.Functor)

/**
 * Less strict version of [`chain`](#chain).
 *
 * @since 0.1.0
 * @category Monad
 */
export const chainW =
  <A, E2, B>(f: (a: A) => SourceEither<E2, B>) =>
  <E1>(ma: SourceEither<E1, A>): SourceEither<E1 | E2, B> =>
    pipe(ma, S.chain(E.fold((a) => left<E1 | E2, B>(a), f)))

/**
 * @since 0.1.0
 * @category Monad
 */
export const chain: <A, E, B>(
  f: (a: A) => SourceEither<E, B>
) => (ma: SourceEither<E, A>) => SourceEither<E, B> = chainW

/**
 * Derivable from `Monad`.
 *
 * @since 0.6.0
 * @category Combinators
 */
export const flatten: <E, A>(
  mma: SourceEither<E, SourceEither<E, A>>
) => SourceEither<E, A> =
  /*#__PURE__*/
  chain(identity)

/** @since 0.1.0 */
export const of: Applicative2<URI>['of'] = right

/**
 * Derivable from `MonadThrow`.
 *
 * @since 0.1.0
 */
export const filterOrElse: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (
    ma: SourceEither<E, A>
  ) => SourceEither<E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (
    ma: SourceEither<E, A>
  ) => SourceEither<E, A>
} = <E, A>(
  predicate: Predicate<A>,
  onFalse: (a: A) => E
): ((ma: SourceEither<E, A>) => SourceEither<E, A>) =>
  chain((a) => (predicate(a) ? of(a) : throwError(onFalse(a))))

/**
 * Derivable from `MonadThrow`.
 *
 * @since 0.1.0
 */
export const fromEither: <E, A>(ma: E.Either<E, A>) => SourceEither<E, A> = (
  ma
) => (ma._tag === 'Left' ? throwError(ma.left) : of(ma.right))

/**
 * Derivable from `MonadThrow`.
 *
 * @since 0.1.0
 */
export const fromOption =
  <E>(onNone: () => E) =>
  <A>(ma: Option<A>): SourceEither<E, A> =>
    ma._tag === 'None' ? throwError(onNone()) : of(ma.value)

/**
 * Derivable from `MonadThrow`.
 *
 * @since 0.1.0
 */
export const fromPredicate: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (
    a: A
  ) => SourceEither<E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (
    a: A
  ) => SourceEither<E, A>
} =
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E) =>
  (a: A): SourceEither<E, A> =>
    predicate(a) ? of(a) : throwError(onFalse(a))

/**
 * @since 0.1.0
 * @category MonadThrow
 */
export const throwError: MonadThrow2<URI>['throwError'] = left

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/** @since 2.0.0 */
export const URI = 'wonka/SourceEither'

/** @since 2.0.0 */
export type URI = typeof URI

/** @since 2.0.0 */
declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    [URI]: SourceEither<E, A>
  }
}

/* istanbul ignore next */
const _map: Functor2<URI>['map'] = (fa, f) => pipe(fa, map(f))
/* istanbul ignore next */
const _ap: Apply2<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa))
/* istanbul ignore next */
const _chain: Monad2<URI>['chain'] = (ma, f) => pipe(ma, chain(f))
/* istanbul ignore next */
const _biMap: Bifunctor2<URI>['bimap'] = (fea, f, g) => pipe(fea, bimap(f, g))
/* istanbul ignore next */
const _mapLeft: Bifunctor2<URI>['mapLeft'] = (fea, f) => pipe(fea, mapLeft(f))
/* istanbul ignore next */
const _alt: Alt2<URI>['alt'] = (fx, fy) => pipe(fx, alt(fy))

/**
 * @since 0.1.0
 * @category Instances
 */
export const Functor: Functor2<URI> = {
  URI,
  map: _map,
}

/**
 * Derivable from `Functor`.
 *
 * @since 0.1.0
 * @category Combinators
 */
export const flap =
  /*#__PURE__*/
  flap_(Functor)

/**
 * @since 0.1.0
 * @category Instances
 */
export const Apply: Apply2<URI> = {
  URI,
  map: _map,
  ap: _ap,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const Applicative: Applicative2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const Chain: Chain2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain,
}

/**
 * Composes computations in sequence, using the return value of one computation
 * to determine the next computation and keeping only the result of the first.
 *
 * Derivable from `Monad`.
 *
 * @since 0.1.0
 * @category Combinators
 */
export const chainFirst: <E, A, B>(
  f: (a: A) => SourceEither<E, B>
) => (ma: SourceEither<E, A>) => SourceEither<E, A> =
  /*#__PURE__*/
  chainFirst_(Chain)

/**
 * Less strict version of [`chainFirst`](#chainfirst).
 *
 * Derivable from `Chain`.
 *
 * @since 0.1.0
 * @category Combinators
 */
export const chainFirstW: <E2, A, B>(
  f: (a: A) => SourceEither<E2, B>
) => <E1>(ma: SourceEither<E1, A>) => SourceEither<E1 | E2, A> =
  chainFirst as any

/**
 * @since 0.1.0
 * @category Instances
 */
export const Monad: Monad2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: _chain,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const Bifunctor: Bifunctor2<URI> = {
  URI,
  bimap: _biMap,
  mapLeft: _mapLeft,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const Alt: Alt2<URI> = {
  URI,
  map: _map,
  alt: _alt,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const MonadIO: MonadIO2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: _chain,
  fromIO,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const MonadTask: MonadTask2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: _chain,
  fromIO,
  fromTask,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const MonadSource: MonadSource2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: _chain,
  fromIO,
  fromTask,
  fromSource,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const MonadThrow: MonadThrow2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: _chain,
  throwError,
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/** @since 0.1.0 */
export const Do: SourceEither<never, Record<PropertyKey, unknown>> =
  /*#__PURE__*/
  of({})

/** @since 0.1.0 */
export const bindTo =
  /*#__PURE__*/
  bindTo_(Functor)

/** @since 0.1.0 */
export const bind =
  /*#__PURE__*/
  bind_(Chain)

/** @since 0.1.0 */
export const bindW: <N extends string, A, E2, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => SourceEither<E2, B>
) => <E1>(
  fa: SourceEither<E1, A>
) => SourceEither<
  E1 | E2,
  { readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }
> = bind as any

/** @since 0.1.0 */
export const toTaskEither: <E, A>(
  o: SourceEither<E, A>
) => TE.TaskEither<E, A> = S.toTask
