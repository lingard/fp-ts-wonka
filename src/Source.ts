/**
 * A “[source](https://wonka.kitten.sh/api/sources)" in Wonka is a provider of
 * data. It provides data to a “sink” when the “sink” requests it. This is
 * called a pull signal and for synchronous sources no time will pass between
 * the sink pulling a new value and a source sending it. For asynchronous
 * sources, the source may either ignore pull signals and just push values or
 * send one some time after the pull signal.
 *
 * @since 0.1.0
 */
import { Alt1 } from 'fp-ts/Alt'
import { Alternative1 } from 'fp-ts/Alternative'
import { Applicative1 } from 'fp-ts/Applicative'
import { Apply1, apS as apS_ } from 'fp-ts/Apply'
import { Compactable1 } from 'fp-ts/Compactable'
import { Separated } from 'fp-ts/Separated'
import * as E from 'fp-ts/Either'
import { Filterable1 } from 'fp-ts/Filterable'
import { flow, identity, pipe } from 'fp-ts/function'
import { Predicate } from 'fp-ts/Predicate'
import { Refinement } from 'fp-ts/Refinement'
import { bindTo as bindTo_, flap as flap_, Functor1 } from 'fp-ts/Functor'
import { bind as bind_, Chain1, chainFirst as chainFirst_ } from 'fp-ts/Chain'
import { Monad1 } from 'fp-ts/Monad'
import { MonadIO1 } from 'fp-ts/MonadIO'
import { MonadTask1 } from 'fp-ts/MonadTask'
import { Monoid } from 'fp-ts/Monoid'
import * as O from 'fp-ts/Option'
import * as Wonka from 'wonka'
import { MonadSource1 } from './MonadSource'
import { Task } from 'fp-ts/lib/Task'
import { defer } from './sources'
import { Pointed1 } from 'fp-ts/lib/Pointed'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @since 0.1.0
 * @category Model
 */
export type Source<A> = Wonka.Source<A>

// -------------------------------------------------------------------------------------
// natural transformations
// -------------------------------------------------------------------------------------

/**
 * @since 0.1.0
 * @category Natural transformations
 */
export const fromOption = <A>(o: O.Option<A>): Wonka.Source<A> =>
  O.isNone(o) ? Wonka.empty : Wonka.fromValue(o.value)

/**
 * @since 0.1.0
 * @category Natural transformations
 */
export const fromIO: MonadIO1<URI>['fromIO'] = (ma) =>
  defer(() => Wonka.fromValue(ma()))

/**
 * @since 0.1.0
 * @category Natural transformations
 */
export const fromTask: MonadTask1<URI>['fromTask'] = (ma) =>
  defer(() => Wonka.fromPromise(ma()))

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const _map: Functor1<URI>['map'] = (fa, f) => pipe(fa, map(f))
const _ap: Apply1<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa))
/* istanbul ignore next */
const _chain: Monad1<URI>['chain'] = (fa, f) => pipe(fa, chain(f))
/* istanbul ignore next */
const _alt: Alt1<URI>['alt'] = (me, that) => pipe(me, alt(that))
/* istanbul ignore next */
const _filter: Filterable1<URI>['filter'] = <A>(
  fa: Wonka.Source<A>,
  p: Predicate<A>
) => pipe(fa, filter(p))
/* istanbul ignore next */
const _filterMap: Filterable1<URI>['filterMap'] = <A, B>(
  fa: Wonka.Source<A>,
  f: (a: A) => O.Option<B>
) => pipe(fa, filterMap(f))
/* istanbul ignore next */
const _partition: Filterable1<URI>['partition'] = <A>(
  fa: Wonka.Source<A>,
  p: Predicate<A>
) => pipe(fa, partition(p))
/* istanbul ignore next */
const _partitionMap: Filterable1<URI>['partitionMap'] = (fa, f) =>
  pipe(fa, partitionMap(f))

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
) => (fa: Wonka.Source<A>) => Wonka.Source<B> = (f) => (fa) =>
  pipe(fa, Wonka.map(f))

/**
 * Apply a function to an argument under a type constructor.
 *
 * @since 0.1.0
 * @category Apply
 */
export const ap: <A>(
  fa: Wonka.Source<A>
) => <B>(fab: Wonka.Source<(a: A) => B>) => Wonka.Source<B> = (fa) => (fab) =>
  pipe(
    Wonka.combine(fab, fa),
    Wonka.map(([f, a]) => f(a))
  )

/**
 * Apply a function to an argument under a type constructor.
 *
 * @since 0.1.0
 * @category Apply
 */
export const apW: <A>(
  fa: Source<A>
) => <B>(fab: Source<(a: A) => B>) => Source<B> = ap as any

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * Derivable from `Apply`.
 *
 * @since 0.1.0
 * @category Combinators
 */
export const apFirst: <B>(
  fb: Wonka.Source<B>
) => <A>(fa: Wonka.Source<A>) => Wonka.Source<A> = (fb) =>
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
export const apSecond = <B>(
  fb: Wonka.Source<B>
): (<A>(fa: Wonka.Source<A>) => Wonka.Source<B>) =>
  flow(
    map(() => (b: B) => b),
    ap(fb)
  )

/**
 * @since 0.1.0
 * @category Pointed
 */
export const of: Pointed1<URI>['of'] = Wonka.fromValue

/**
 * Composes computations in sequence, using the return value of one computation
 * to determine the next computation.
 *
 * @since 0.1.0
 * @category Monad
 */
export const chain: <A, B>(
  f: (a: A) => Wonka.Source<B>
) => (ma: Wonka.Source<A>) => Wonka.Source<B> = (f) => (ma) =>
  pipe(ma, Wonka.mergeMap(f))

/**
 * Derivable from `Monad`.
 *
 * @since 0.1.0
 * @category Combinators
 */
export const flatten: <A>(
  mma: Wonka.Source<Wonka.Source<A>>
) => Wonka.Source<A> =
  /*#__PURE__*/
  chain(identity)

/**
 * Identifies an associative operation on a type constructor. It is similar to
 * `Semigroup`, except that it applies to types of kind `* -> *`.
 *
 * @since 0.1.0
 * @category Alt
 */
export const alt: <A>(
  that: () => Wonka.Source<A>
) => (fa: Wonka.Source<A>) => Wonka.Source<A> = (that) => (fa) =>
  Wonka.merge([fa, that()])

/**
 * @since 0.1.0
 * @category Filterable
 */
export const filterMap =
  <A, B>(f: (a: A) => O.Option<B>) =>
  (fa: Wonka.Source<A>): Wonka.Source<B> =>
    pipe(
      fa,
      Wonka.mergeMap((a) =>
        pipe(
          f(a),
          O.fold<B, Wonka.Source<B>>(() => Wonka.empty, of)
        )
      )
    )

/**
 * @since 0.1.0
 * @category Compactable
 */
export const compact: <A>(fa: Wonka.Source<O.Option<A>>) => Wonka.Source<A> =
  /*#__PURE__*/
  filterMap(identity)

/**
 * @since 0.1.0
 * @category Filterable
 */
export const partitionMap: <A, B, C>(
  f: (a: A) => E.Either<B, C>
) => (fa: Wonka.Source<A>) => Separated<Wonka.Source<B>, Wonka.Source<C>> =
  (f) => (fa) => ({
    left: pipe(
      fa,
      filterMap((a) => O.fromEither(E.swap(f(a))))
    ),
    right: pipe(
      fa,
      filterMap((a) => O.fromEither(f(a)))
    ),
  })

/**
 * @since 0.1.0
 * @category Compactable
 */
export const separate: <A, B>(
  fa: Wonka.Source<E.Either<A, B>>
) => Separated<Wonka.Source<A>, Wonka.Source<B>> =
  /*#__PURE__*/
  partitionMap(identity)

/**
 * @since 0.1.0
 * @category Filterable
 */
export const filter: {
  <A, B extends A>(refinement: Refinement<A, B>): (
    fa: Wonka.Source<A>
  ) => Wonka.Source<B>
  <A>(predicate: Predicate<A>): (fa: Wonka.Source<A>) => Wonka.Source<A>
} =
  <A>(p: Predicate<A>) =>
  (fa: Wonka.Source<A>) =>
    pipe(fa, filterMap(O.fromPredicate(p)))

/**
 * @since 0.1.0
 * @category Filterable
 */
export const partition: {
  <A, B extends A>(refinement: Refinement<A, B>): (
    fa: Wonka.Source<A>
  ) => Separated<Wonka.Source<A>, Wonka.Source<B>>
  <A>(predicate: Predicate<A>): (
    fa: Wonka.Source<A>
  ) => Separated<Wonka.Source<A>, Wonka.Source<A>>
} =
  <A>(p: Predicate<A>) =>
  (fa: Wonka.Source<A>) =>
    pipe(fa, partitionMap(E.fromPredicate(p, identity)))

/**
 * @since 0.1.0
 * @category Alternative
 */
export const zero: Alternative1<URI>['zero'] = () => Wonka.empty

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @since 0.1.0
 * @category Instances
 */
export const URI = 'wonka/Source'

/**
 * @since 0.1.0
 * @category Instances
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Wonka.Source<A>
  }
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const getMonoid = <A = never>(): Monoid<Wonka.Source<A>> => ({
  concat: (x, y) => Wonka.merge([x, y]),
  empty: Wonka.empty,
})

/**
 * @since 0.1.0
 * @category Instances
 */
export const Functor: Functor1<URI> = {
  URI,
  map: _map,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const Pointed: Pointed1<URI> = {
  URI,
  of,
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
export const Apply: Apply1<URI> = {
  URI,
  map: _map,
  ap: _ap,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const Applicative: Applicative1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const Chain: Chain1<URI> = {
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
export const chainFirst: <A, B>(
  f: (a: A) => Wonka.Source<B>
) => (ma: Wonka.Source<A>) => Wonka.Source<A> = chainFirst_(Chain)

/**
 * @since 0.1.0
 * @category Instances
 */
export const Monad: Monad1<URI> = {
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
export const Alt: Alt1<URI> = {
  URI,
  map: _map,
  alt: _alt,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const Alternative: Alternative1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  alt: _alt,
  zero,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const Compactable: Compactable1<URI> = {
  URI,
  compact,
  separate,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const Filterable: Filterable1<URI> = {
  URI,
  compact,
  separate,
  map: _map,
  filter: _filter,
  filterMap: _filterMap,
  partition: _partition,
  partitionMap: _partitionMap,
}

/**
 * @since 0.1.0
 * @category Instances
 */
export const MonadIO: MonadIO1<URI> = {
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
export const MonadTask: MonadTask1<URI> = {
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
export const MonadSource: MonadSource1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: _chain,
  fromIO,
  fromTask,
  fromSource: identity,
}

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/** @since 0.1.0 */
export const Do: Wonka.Source<Record<PropertyKey, unknown>> =
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

// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------

/** @since 0.1.0 */
export const apS =
  /*#__PURE__*/
  apS_(Apply)

/** @since 0.1.0 */
export const apSW: <A, N extends string, B>(
  name: Exclude<N, keyof A>,
  fb: Source<B>
) => (
  fa: Source<A>
) => Source<{ readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }> =
  apS as any

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/** @since 0.1.0 */
export const toTask =
  <A>(s: Wonka.Source<A>): Task<A> =>
  () =>
    Wonka.toPromise(s)
