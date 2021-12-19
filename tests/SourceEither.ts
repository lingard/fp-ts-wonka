import * as assert from 'assert'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import * as E from 'fp-ts/Either'
import * as IO from 'fp-ts/IO'
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Wonka from 'wonka'
import * as S from '../src/Source'
import * as _ from '../src/SourceEither'
import { bufferTime } from '../src/sources'

describe('SourceEither', () => {
  it('rightIO', async () => {
    const events = await pipe(
      _.rightIO(IO.of(1)),
      bufferTime(10),
      Wonka.toPromise
    )

    assert.deepStrictEqual(events, [E.right(1)])
  })
  it('leftIO', async () => {
    const events = await pipe(
      _.leftIO(IO.of(1)),
      bufferTime(10),
      Wonka.toPromise
    )

    assert.deepStrictEqual(events, [E.left(1)])
  })

  it('fromTaskEither', async () => {
    const events = await pipe(
      _.fromTaskEither(TE.right(1)),
      bufferTime(10),
      Wonka.toPromise
    )

    assert.deepStrictEqual(events, [E.right(1)])
  })

  it('toTaskEither', async () => {
    const events = await _.toTaskEither(_.right(1))()

    assert.deepStrictEqual(events, E.right(1))
  })

  it('fromTask', async () => {
    const events = await pipe(
      _.fromTask(T.of(1)),
      bufferTime(10),
      Wonka.toPromise
    )

    assert.deepStrictEqual(events, [E.right(1)])
  })

  it('match left', () => {
    const f = (n: number): Wonka.Source<number> => S.of(n * 2)
    const g = (n: number): Wonka.Source<number> => S.of(n * 3)
    const events = pipe(_.left(2), _.match(f, g), Wonka.toArray)

    assert.deepStrictEqual(events, [4])
  })

  it('match right', () => {
    const f = (n: number): Wonka.Source<number> => S.of(n * 2)
    const g = (n: number): Wonka.Source<number> => S.of(n * 3)
    const events = pipe(_.right(3), _.match(f, g), Wonka.toArray)
    assert.deepStrictEqual(events, [9])
  })

  it('matchE', () => {
    const f = _.matchE(
      () => S.of('left'),
      () => S.of('right')
    )
    const left = pipe(f(_.left('')), Wonka.toArray)
    const right = pipe(f(_.right(1)), Wonka.toArray)

    assert.deepStrictEqual(right, ['right'])
    assert.deepStrictEqual(left, ['left'])
  })

  it('getOrElse', () => {
    const onLeft = (s: string): Wonka.Source<number> => S.of(s.length)
    const left = pipe(_.left('four'), _.getOrElse(onLeft), Wonka.toArray)
    const right = pipe(_.right(1), _.getOrElse(onLeft), Wonka.toArray)

    assert.deepStrictEqual(left, [4])
    assert.deepStrictEqual(right, [1])
  })

  it('orElse', () => {
    const onLeft = (s: string): _.SourceEither<number, number> =>
      _.left(s.length)
    const left = pipe(_.left('four'), _.orElse(onLeft), Wonka.toArray)
    const right = pipe(_.right(1), _.orElse(onLeft), Wonka.toArray)

    assert.deepStrictEqual(left, [E.left(4)])
    assert.deepStrictEqual(right, [E.right(1)])
  })

  it('orElseFirst', () => {
    const f = _.orElseFirst((e: string) =>
      e.length <= 1 ? _.right(true) : _.left(e + '!')
    )

    assert.deepStrictEqual(pipe(_.right(1), f, Wonka.toArray), [E.right(1)])
    assert.deepStrictEqual(pipe(_.left('a'), f, Wonka.toArray), [E.left('a')])
    assert.deepStrictEqual(pipe(_.left('aa'), f, Wonka.toArray), [
      E.left('aa!'),
    ])
  })

  it('orElseFirstW', () => {
    const f = _.orElseFirstW((e: string) =>
      e.length <= 1 ? _.right(true) : _.left(e + '!')
    )

    assert.deepStrictEqual(pipe(_.right(1), f, Wonka.toArray), [E.right(1)])
    assert.deepStrictEqual(pipe(_.left('a'), f, Wonka.toArray), [E.left('a')])
    assert.deepStrictEqual(pipe(_.left('aa'), f, Wonka.toArray), [
      E.left('aa!'),
    ])
  })

  it('orLeft', () => {
    const f = _.orLeft((e: string) => S.of(e + '!'))

    assert.deepStrictEqual(pipe(_.right(1), f, Wonka.toArray), [E.right(1)])
    assert.deepStrictEqual(pipe(_.left('a'), f, Wonka.toArray), [E.left('a!')])
  })

  it('swap left to right', () => {
    const e = pipe(_.left(1), _.swap, Wonka.toArray)

    assert.deepStrictEqual(e, [E.right(1)])
  })

  it('swap right to left', () => {
    const e = pipe(_.right(1), _.swap, Wonka.toArray)

    assert.deepStrictEqual(e, [E.left(1)])
  })

  describe('Monad', () => {
    it('of', () => {
      const fea = _.of(1)
      const x = pipe(fea, Wonka.toArray)

      assert.deepStrictEqual(x, [E.right(1)])
    })

    it('map', () => {
      const double = (n: number): number => n * 2
      const x = pipe(_.right(1), _.map(double), Wonka.toArray)

      assert.deepStrictEqual(x, [E.right(2)])
    })

    it('ap', () => {
      const double = (n: number): number => n * 2
      const mab = _.right(double)
      const ma = _.right(1)
      const x = pipe(mab, _.ap(ma), Wonka.toArray)

      assert.deepStrictEqual(x, [E.right(2)])
    })

    it('chain', () => {
      const f = (a: string): _.SourceEither<string, number> =>
        a.length > 2 ? _.right(a.length) : _.left('text')
      const e1 = pipe(_.right('four'), _.chain(f), Wonka.toArray)

      assert.deepStrictEqual(e1, [E.right(4)])

      const e2 = pipe(_.right('a'), _.chain(f), Wonka.toArray)

      assert.deepStrictEqual(e2, [E.left('text')])

      const e3 = pipe(_.left('b'), _.chain(f), Wonka.toArray)

      assert.deepStrictEqual(e3, [E.left('b')])
    })

    it('left identity', () => {
      const f = (a: string): _.SourceEither<string, number> =>
        a.length > 2 ? _.right(a.length) : _.left('text')
      const a = 'text'
      const e1 = pipe(_.of<string, string>(a), _.chain(f), Wonka.toArray)
      const e2 = pipe(f(a), Wonka.toArray)

      assert.deepStrictEqual(e1, e2)
    })

    it('right identity', () => {
      const fa = _.of(1)
      const e1 = pipe(fa, _.chain(_.of), Wonka.toArray)
      const e2 = pipe(fa, Wonka.toArray)

      assert.deepStrictEqual(e1, e2)
    })
  })

  it('apFirst', () => {
    assert.deepStrictEqual(
      pipe(_.right('a'), _.apFirst(_.right('b')), Wonka.toArray),
      [E.right('a')]
    )

    const events = pipe(_.right(1), _.apFirst(_.right(2)), Wonka.toArray)

    assert.deepStrictEqual(events, [E.right(1)])
  })

  it('apSecond', () => {
    assert.deepStrictEqual(
      pipe(_.right('a'), _.apSecond(_.right('b')), Wonka.toArray),
      [E.right('b')]
    )

    const events = pipe(_.right(1), _.apSecond(_.right(2)), Wonka.toArray)

    assert.deepStrictEqual(events, [E.right(2)])
  })

  it('chainFirst', () => {
    const f = (a: string): _.SourceEither<string, number> =>
      a.length > 2 ? _.right(a.length) : _.left('b')
    const e1 = pipe(_.right('aaaa'), _.chainFirst(f), Wonka.toArray)

    assert.deepStrictEqual(e1, [E.right('aaaa')])
  })

  describe('Bifunctor', () => {
    it('bimap', () => {
      const f = (s: string): number => s.length
      const g = (n: number): boolean => n > 2

      const e1 = pipe(_.right(1), _.bimap(f, g), Wonka.toArray)
      assert.deepStrictEqual(e1, [E.right(false)])
      const e2 = pipe(_.left('foo'), _.bimap(f, g), Wonka.toArray)
      assert.deepStrictEqual(e2, [E.left(3)])
    })

    it('mapLeft', () => {
      const double = (n: number): number => n * 2
      const e = pipe(_.left(1), _.mapLeft(double), Wonka.toArray)

      assert.deepStrictEqual(e, [E.left(2)])
    })
  })

  describe('Alt', () => {
    it('alt right right', () => {
      const fx = _.right(1)
      const fy = () => _.right(2)
      const e1 = pipe(fx, _.alt(fy), Wonka.toArray)

      assert.deepStrictEqual(e1, [E.right(1)])
    })

    it('alt left right', () => {
      const fx = _.left<number, number>(1)
      const fy = () => _.right<number, number>(2)
      const e1 = pipe(fx, _.alt(fy), Wonka.toArray)

      assert.deepStrictEqual(e1, [E.right(2)])
    })

    it('associativity', () => {
      const fa = _.left<number, number>(1)
      const ga = () => _.right<number, number>(2)
      const ha = () => _.right<number, number>(3)

      const e1 = pipe(pipe(fa, _.alt(ga)), _.alt(ha), Wonka.toArray)

      const e2 = pipe(
        fa,
        _.alt(() => pipe(ga(), _.alt(ha))),
        Wonka.toArray
      )

      assert.deepStrictEqual(e1, e2)
    })

    it('distributivity', () => {
      const double = (n: number): number => n * 2
      const fx = _.left<string, number>('left')
      const fy = () => _.right<string, number>(1)
      const e1 = pipe(fx, _.alt(fy), _.map(double), Wonka.toArray)
      const e2 = pipe(
        pipe(fx, _.map(double)),
        _.alt(() => pipe(fy(), _.map(double))),
        Wonka.toArray
      )

      assert.deepStrictEqual(e1, e2)
    })
  })

  it('do notation', () => {
    const t = pipe(
      _.right(1),
      _.bindTo('a'),
      _.bind('b', () => _.right('b')),
      Wonka.toArray
    )

    assert.deepStrictEqual(t, [E.right({ a: 1, b: 'b' })])
  })

  it('apS', () => {
    assert.deepStrictEqual(
      pipe(_.right(1), _.bindTo('a'), _.apS('b', _.right('b')), Wonka.toArray),
      [E.right({ a: 1, b: 'b' })]
    )
  })

  it('fromOption', () => {
    assert.deepStrictEqual(
      pipe(_.fromOption(() => 'a')(O.some(1)), Wonka.toArray),
      [E.right(1)]
    )
    assert.deepStrictEqual(
      pipe(_.fromOption(() => 'a')(O.none), Wonka.toArray),
      [E.left('a')]
    )
  })

  it('fromEither', () => {
    assert.deepStrictEqual(pipe(_.fromEither(E.right(1)), Wonka.toArray), [
      E.right(1),
    ])
    assert.deepStrictEqual(pipe(_.fromEither(E.left('a')), Wonka.toArray), [
      E.left('a'),
    ])
  })

  it('filterOrElse', () => {
    assert.deepStrictEqual(
      pipe(
        _.filterOrElse(
          (n: number) => n > 0,
          () => 'a'
        )(_.of(1)),
        Wonka.toArray
      ),
      [E.right(1)]
    )
    assert.deepStrictEqual(
      pipe(
        _.filterOrElse(
          (n: number) => n > 0,
          () => 'a'
        )(_.of(-1)),
        Wonka.toArray
      ),
      [E.left('a')]
    )
  })

  it('filterOrElse', () => {
    assert.deepStrictEqual(
      pipe(
        _.fromPredicate(
          (n: number) => n > 0,
          () => 'a'
        )(1),
        Wonka.toArray
      ),
      [E.right(1)]
    )
    assert.deepStrictEqual(
      pipe(
        _.fromPredicate(
          (n: number) => n > 0,
          () => 'a'
        )(-1),
        Wonka.toArray
      ),
      [E.left('a')]
    )
  })
})
