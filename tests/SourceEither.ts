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

  it('match left', async () => {
    const f = (n: number): Wonka.Source<number> => S.of(n * 2)
    const g = (n: number): Wonka.Source<number> => S.of(n * 3)
    const events = await pipe(
      _.left(2),
      _.match(f, g),
      bufferTime(10),
      Wonka.toPromise
    )

    assert.deepStrictEqual(events, [4])
  })

  it('match right', async () => {
    const f = (n: number): Wonka.Source<number> => S.of(n * 2)
    const g = (n: number): Wonka.Source<number> => S.of(n * 3)
    const events = await pipe(
      _.right(3),
      _.match(f, g),
      bufferTime(10),
      Wonka.toPromise
    )
    assert.deepStrictEqual(events, [9])
  })

  it('matchE', async () => {
    const f = _.matchE(
      () => S.of('left'),
      () => S.of('right')
    )
    const left = await pipe(f(_.left('')), Wonka.toPromise)
    const right = await pipe(f(_.right(1)), Wonka.toPromise)

    assert.deepStrictEqual(right, 'right')
    assert.deepStrictEqual(left, 'left')
  })

  it('getOrElse', async () => {
    const onLeft = (s: string): Wonka.Source<number> => S.of(s.length)
    const left = await pipe(
      _.left('four'),
      _.getOrElse(onLeft),
      bufferTime(10),
      Wonka.toPromise
    )
    const right = await pipe(
      _.right(1),
      _.getOrElse(onLeft),
      bufferTime(10),
      Wonka.toPromise
    )

    assert.deepStrictEqual(left, [4])
    assert.deepStrictEqual(right, [1])
  })

  it('orElse', async () => {
    const onLeft = (s: string): _.SourceEither<number, number> =>
      _.left(s.length)
    const left = await pipe(
      _.left('four'),
      _.orElse(onLeft),
      bufferTime(10),
      Wonka.toPromise
    )
    const right = await pipe(
      _.right(1),
      _.orElse(onLeft),
      bufferTime(10),
      Wonka.toPromise
    )

    assert.deepStrictEqual(left, [E.left(4)])
    assert.deepStrictEqual(right, [E.right(1)])
  })

  it('orElseFirst', async () => {
    const f = _.orElseFirst((e: string) =>
      e.length <= 1 ? _.right(true) : _.left(e + '!')
    )

    assert.deepStrictEqual(
      await pipe(_.right(1), f, Wonka.toPromise),
      E.right(1)
    )
    assert.deepStrictEqual(
      await pipe(_.left('a'), f, Wonka.toPromise),
      E.left('a')
    )
    assert.deepStrictEqual(
      await pipe(_.left('aa'), f, Wonka.toPromise),
      E.left('aa!')
    )
  })

  it('orElseFirstW', async () => {
    const f = _.orElseFirstW((e: string) =>
      e.length <= 1 ? _.right(true) : _.left(e + '!')
    )

    assert.deepStrictEqual(
      await pipe(_.right(1), f, Wonka.toPromise),
      E.right(1)
    )
    assert.deepStrictEqual(
      await pipe(_.left('a'), f, Wonka.toPromise),
      E.left('a')
    )
    assert.deepStrictEqual(
      await pipe(_.left('aa'), f, Wonka.toPromise),
      E.left('aa!')
    )
  })

  it('orLeft', async () => {
    const f = _.orLeft((e: string) => S.of(e + '!'))

    assert.deepStrictEqual(
      await pipe(_.right(1), f, Wonka.toPromise),
      E.right(1)
    )
    assert.deepStrictEqual(
      await pipe(_.left('a'), f, Wonka.toPromise),
      E.left('a!')
    )
  })

  it('swap left to right', async () => {
    const e = await pipe(_.left(1), _.swap, bufferTime(10), Wonka.toPromise)
    assert.deepStrictEqual(e, [E.right(1)])
  })

  it('swap right to left', async () => {
    const e = await pipe(_.right(1), _.swap, bufferTime(10), Wonka.toPromise)
    assert.deepStrictEqual(e, [E.left(1)])
  })

  describe('Monad', () => {
    it('of', async () => {
      const fea = _.of(1)
      const x = await pipe(fea, bufferTime(10), Wonka.toPromise)

      assert.deepStrictEqual(x, [E.right(1)])
    })

    it('map', async () => {
      const double = (n: number): number => n * 2
      const x = await pipe(
        _.right(1),
        _.map(double),
        bufferTime(10),
        Wonka.toPromise
      )
      assert.deepStrictEqual(x, [E.right(2)])
    })

    it('ap', async () => {
      const double = (n: number): number => n * 2
      const mab = _.right(double)
      const ma = _.right(1)
      const x = await pipe(mab, _.ap(ma), bufferTime(10), Wonka.toPromise)
      assert.deepStrictEqual(x, [E.right(2)])
    })

    it('chain', async () => {
      const f = (a: string): _.SourceEither<string, number> =>
        a.length > 2 ? _.right(a.length) : _.left('text')
      const e1 = await pipe(
        _.right('four'),
        _.chain(f),
        bufferTime(10),
        Wonka.toPromise
      )

      assert.deepStrictEqual(e1, [E.right(4)])

      const e2 = await pipe(
        _.right('a'),
        _.chain(f),
        bufferTime(10),
        Wonka.toPromise
      )

      assert.deepStrictEqual(e2, [E.left('text')])

      const e3 = await pipe(
        _.left('b'),
        _.chain(f),
        bufferTime(10),
        Wonka.toPromise
      )

      assert.deepStrictEqual(e3, [E.left('b')])
    })

    it('left identity', async () => {
      const f = (a: string): _.SourceEither<string, number> =>
        a.length > 2 ? _.right(a.length) : _.left('text')
      const a = 'text'
      const e1 = await pipe(
        _.of<string, string>(a),
        _.chain(f),
        bufferTime(10),
        Wonka.toPromise
      )
      const e2 = await pipe(f(a), bufferTime(10), Wonka.toPromise)

      assert.deepStrictEqual(e1, e2)
    })

    it('right identity', async () => {
      const fa = _.of(1)
      const e1 = await pipe(fa, _.chain(_.of), bufferTime(10), Wonka.toPromise)
      const e2 = await pipe(fa, bufferTime(10), Wonka.toPromise)

      assert.deepStrictEqual(e1, e2)
    })
  })

  it('apFirst', async () => {
    assert.deepStrictEqual(
      await pipe(_.right('a'), _.apFirst(_.right('b')), Wonka.toPromise),
      E.right('a')
    )

    const events = await pipe(
      _.right(1),
      _.apFirst(_.right(2)),
      bufferTime(10),
      Wonka.toPromise
    )

    assert.deepStrictEqual(events, [E.right(1)])
  })

  it('apSecond', async () => {
    assert.deepStrictEqual(
      await pipe(_.right('a'), _.apSecond(_.right('b')), Wonka.toPromise),
      E.right('b')
    )

    const events = await pipe(
      _.right(1),
      _.apSecond(_.right(2)),
      bufferTime(10),
      Wonka.toPromise
    )

    assert.deepStrictEqual(events, [E.right(2)])
  })

  it('chainFirst', async () => {
    const f = (a: string): _.SourceEither<string, number> =>
      a.length > 2 ? _.right(a.length) : _.left('b')
    const e1 = await pipe(
      _.right('aaaa'),
      _.chainFirst(f),
      bufferTime(10),
      Wonka.toPromise
    )

    assert.deepStrictEqual(e1, [E.right('aaaa')])
  })

  describe('Bifunctor', () => {
    it('bimap', async () => {
      const f = (s: string): number => s.length
      const g = (n: number): boolean => n > 2

      const e1 = await pipe(
        _.right(1),
        _.bimap(f, g),
        bufferTime(10),
        Wonka.toPromise
      )
      assert.deepStrictEqual(e1, [E.right(false)])
      const e2 = await pipe(
        _.left('foo'),
        _.bimap(f, g),
        bufferTime(10),
        Wonka.toPromise
      )
      assert.deepStrictEqual(e2, [E.left(3)])
    })

    it('mapLeft', async () => {
      const double = (n: number): number => n * 2
      const e = await pipe(
        _.left(1),
        _.mapLeft(double),
        bufferTime(10),
        Wonka.toPromise
      )
      assert.deepStrictEqual(e, [E.left(2)])
    })
  })

  describe('Alt', () => {
    it('alt right right', async () => {
      const fx = _.right(1)
      const fy = () => _.right(2)
      const e1 = await pipe(fx, _.alt(fy), bufferTime(10), Wonka.toPromise)

      assert.deepStrictEqual(e1, [E.right(1)])
    })

    it('alt left right', async () => {
      const fx = _.left<number, number>(1)
      const fy = () => _.right<number, number>(2)
      const e1 = await pipe(fx, _.alt(fy), bufferTime(10), Wonka.toPromise)

      assert.deepStrictEqual(e1, [E.right(2)])
    })

    it('associativity', async () => {
      const fa = _.left<number, number>(1)
      const ga = () => _.right<number, number>(2)
      const ha = () => _.right<number, number>(3)

      const e1 = await pipe(
        pipe(fa, _.alt(ga)),
        _.alt(ha),
        bufferTime(10),
        Wonka.toPromise
      )

      const e2 = await pipe(
        fa,
        _.alt(() => pipe(ga(), _.alt(ha))),
        bufferTime(10),
        Wonka.toPromise
      )

      assert.deepStrictEqual(e1, e2)
    })

    it('distributivity', async () => {
      const double = (n: number): number => n * 2
      const fx = _.left<string, number>('left')
      const fy = () => _.right<string, number>(1)

      const e1 = await pipe(
        fx,
        _.alt(fy),
        _.map(double),
        bufferTime(10),
        Wonka.toPromise
      )

      const e2 = await pipe(
        pipe(fx, _.map(double)),
        _.alt(() => pipe(fy(), _.map(double))),
        bufferTime(10),
        Wonka.toPromise
      )

      assert.deepStrictEqual(e1, e2)
    })
  })

  it('do notation', async () => {
    const t = await pipe(
      _.right(1),
      _.bindTo('a'),
      _.bind('b', () => _.right('b')),
      bufferTime(10),
      Wonka.toPromise
    )

    assert.deepStrictEqual(t, [E.right({ a: 1, b: 'b' })])
  })

  it('fromOption', async () => {
    assert.deepStrictEqual(
      await pipe(
        _.fromOption(() => 'a')(O.some(1)),
        bufferTime(10),
        Wonka.toPromise
      ),
      [E.right(1)]
    )
    assert.deepStrictEqual(
      await pipe(
        _.fromOption(() => 'a')(O.none),
        bufferTime(10),
        Wonka.toPromise
      ),
      [E.left('a')]
    )
  })

  it('fromEither', async () => {
    assert.deepStrictEqual(
      await pipe(_.fromEither(E.right(1)), bufferTime(10), Wonka.toPromise),
      [E.right(1)]
    )
    assert.deepStrictEqual(
      await pipe(_.fromEither(E.left('a')), bufferTime(10), Wonka.toPromise),
      [E.left('a')]
    )
  })

  it('filterOrElse', async () => {
    assert.deepStrictEqual(
      await pipe(
        _.filterOrElse(
          (n: number) => n > 0,
          () => 'a'
        )(_.of(1)),
        bufferTime(10),
        Wonka.toPromise
      ),
      [E.right(1)]
    )
    assert.deepStrictEqual(
      await pipe(
        _.filterOrElse(
          (n: number) => n > 0,
          () => 'a'
        )(_.of(-1)),
        bufferTime(10),
        Wonka.toPromise
      ),
      [E.left('a')]
    )
  })

  it('filterOrElse', async () => {
    assert.deepStrictEqual(
      await pipe(
        _.fromPredicate(
          (n: number) => n > 0,
          () => 'a'
        )(1),
        bufferTime(10),
        Wonka.toPromise
      ),
      [E.right(1)]
    )
    assert.deepStrictEqual(
      await pipe(
        _.fromPredicate(
          (n: number) => n > 0,
          () => 'a'
        )(-1),
        bufferTime(10),
        Wonka.toPromise
      ),
      [E.left('a')]
    )
  })
})
