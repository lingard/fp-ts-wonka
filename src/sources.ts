/**
 * @since 0.1.0
 * @internal
 */
import * as Wonka from 'wonka'
import { Lazy, pipe } from 'fp-ts/function'

/**
 * @since 0.1.0
 * @internal
 */
export const defer =
  <A>(fa: Lazy<Wonka.Source<A>>): Wonka.Source<A> =>
  (sink) => {
    const source = Wonka.share(fa())

    return source(sink)
  }

/**
 * @since 0.1.0
 * @internal
 */
export const bufferTime =
  (wait: number) =>
  <A>(sa: Wonka.Source<A>): Wonka.Source<A[]> =>
    pipe(sa, Wonka.buffer(Wonka.interval(wait)))
