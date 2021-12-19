import * as assert from 'assert'
import * as Wonka from 'wonka'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as T from 'fp-ts/Task'
import { pipe, identity } from 'fp-ts/function'
import * as _ from '../src/Source'
import { bufferTime } from '../src/sources'

describe('Source', () => {
  it('of', () => {
    const fa = _.of(1)
    const events = Wonka.toArray(fa)

    assert.deepStrictEqual(events, [1])
  })

  it('map', async () => {
    const fa = Wonka.fromArray([1, 2, 3])
    const double = (n: number): number => n * 2
    const fb = pipe(fa, _.map(double))
    const events = Wonka.toArray(fb)

    assert.deepStrictEqual(events, [2, 4, 6])
  })

  it('ap', async () => {
    const fa = Wonka.fromArray([1, 2, 3])
    const double = (n: number): number => n * 2
    const triple = (n: number): number => n * 3
    const fab = Wonka.fromArray([double, triple])
    const events = await pipe(fab, _.ap(fa), bufferTime(10), Wonka.toPromise)

    assert.deepStrictEqual(events, [3, 6, 9])
  })

  it('apFirst', () => {
    const fa = pipe(Wonka.fromArray([1]), _.apFirst(Wonka.fromArray([2])))
    const events = Wonka.toArray(fa)

    assert.deepStrictEqual(events, [1])
  })

  it('apSecond', () => {
    const fa = pipe(Wonka.fromArray([1]), _.apSecond(Wonka.fromArray([2])))
    const events = Wonka.toArray(fa)

    assert.deepStrictEqual(events, [2])
  })

  it('chain', () => {
    const fa = Wonka.fromArray([1, 2, 3])
    const fb = pipe(
      fa,
      _.chain((a) => Wonka.fromArray([a, a + 1]))
    )
    const events = Wonka.toArray(fb)

    assert.deepStrictEqual(events, [1, 2, 2, 3, 3, 4])
  })

  it('chainFirst', () => {
    const fa = Wonka.fromArray([1, 2, 3])
    const fb = pipe(
      fa,
      _.chainFirst((a) => Wonka.fromArray([a, a + 1]))
    )
    const events = Wonka.toArray(fb)

    assert.deepStrictEqual(events, [1, 1, 2, 2, 3, 3])
  })

  it('filterMap', () => {
    const fa = Wonka.fromArray([1, 2, 3])
    const fb = pipe(fa, _.filterMap(O.fromPredicate((n) => n > 1)))
    const events = Wonka.toArray(fb)

    assert.deepStrictEqual(events, [2, 3])
  })

  it('compact', () => {
    const fa = Wonka.fromArray([1, 2, 3].map(O.fromPredicate((n) => n > 1)))
    const fb = _.compact(fa)
    const events = Wonka.toArray(fb)

    assert.deepStrictEqual(events, [2, 3])
  })

  it('filter', () => {
    const fa = Wonka.fromArray([1, 2, 3])
    const events = pipe(
      fa,
      _.filter((n) => n > 1),
      Wonka.toArray
    )

    assert.deepStrictEqual(events, [2, 3])
  })

  it('partitionMap', () => {
    const fa = Wonka.fromArray([1, 2, 3])
    const s = pipe(fa, _.partitionMap(E.fromPredicate((n) => n > 1, identity)))
    const left = Wonka.toArray(s.left)
    const right = Wonka.toArray(s.right)

    assert.deepStrictEqual(left, [1])
    assert.deepStrictEqual(right, [2, 3])
  })

  it('separate', () => {
    const fa = Wonka.fromArray(
      [1, 2, 3].map(E.fromPredicate((n) => n > 1, identity))
    )
    const s = _.separate(fa)
    const left = Wonka.toArray(s.left)
    const right = Wonka.toArray(s.right)

    assert.deepStrictEqual(left, [1])
    assert.deepStrictEqual(right, [2, 3])
  })

  it('partition', () => {
    const fa = Wonka.fromArray([1, 2, 3])
    const s = pipe(
      fa,
      _.partition((n) => n > 1)
    )
    const left = Wonka.toArray(s.left)
    const right = Wonka.toArray(s.right)

    assert.deepStrictEqual(left, [1])
    assert.deepStrictEqual(right, [2, 3])
  })

  it('zero', () => {
    const events = Wonka.toArray(_.zero())

    assert.deepStrictEqual(events, [])
  })

  it('alt', () => {
    const events = pipe(
      _.of(1),
      _.alt(() => _.of(2)),
      Wonka.toArray
    )

    assert.deepStrictEqual(events, [1, 2])
  })

  it('getMonoid', () => {
    const M = _.getMonoid<number>()
    const events = pipe(M.concat(_.of(1), _.of(2)), Wonka.toArray)

    assert.deepStrictEqual(events, [1, 2])
  })

  it('fromOption', () => {
    const events = pipe(_.fromOption(O.some(1)), Wonka.toArray)

    assert.deepStrictEqual(events, [1])

    const noEvents = pipe(_.fromOption(O.none), Wonka.toArray)

    assert.deepStrictEqual(noEvents, [])
  })

  it('fromIO', async () => {
    const events = pipe(
      _.fromIO(() => 1),
      Wonka.toArray
    )

    assert.deepStrictEqual(events, [1])
  })

  it('fromTask', async () => {
    const events = await pipe(_.fromTask(T.of(1)), Wonka.toPromise)

    assert.deepStrictEqual(events, 1)
  })

  it('toTask', async () => {
    const t = await pipe(_.of(1), Wonka.take(1), _.toTask)()

    assert.deepStrictEqual(t, 1)
  })

  it('do notation', () => {
    const t = pipe(
      _.of(1),
      _.bindTo('a'),
      _.bind('b', () => _.of('b')),
      Wonka.toArray
    )

    assert.deepStrictEqual(t, [{ a: 1, b: 'b' }])
  })
})
