/**
 * @since 0.1.0
 * @internal
 */
import * as Wonka from 'wonka'
import { Lazy } from 'fp-ts/function'

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
