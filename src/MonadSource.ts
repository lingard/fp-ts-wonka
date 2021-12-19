/**
 * Lift a computation from the `Source` monad
 *
 * @since 0.1.0
 */
import {
  HKT,
  Kind,
  Kind2,
  Kind3,
  Kind4,
  URIS,
  URIS2,
  URIS3,
  URIS4,
} from 'fp-ts/HKT'
import {
  MonadTask,
  MonadTask1,
  MonadTask2,
  MonadTask2C,
  MonadTask3,
  MonadTask3C,
  MonadTask4,
} from 'fp-ts/MonadTask'
import { Source } from 'wonka'

/**
 * @since 0.1.0
 * @category Type classes
 */
export interface MonadSource<M> extends MonadTask<M> {
  readonly fromSource: <A>(fa: Source<A>) => HKT<M, A>
}

/**
 * @since 0.1.0
 * @category Type classes
 */
export interface MonadSource1<M extends URIS> extends MonadTask1<M> {
  readonly fromSource: <A>(fa: Source<A>) => Kind<M, A>
}

/**
 * @since 0.1.0
 * @category Type classes
 */
export interface MonadSource2<M extends URIS2> extends MonadTask2<M> {
  readonly fromSource: <E, A>(fa: Source<A>) => Kind2<M, E, A>
}

/**
 * @since 0.1.0
 * @category Type classes
 */
export interface MonadSource2C<M extends URIS2, E> extends MonadTask2C<M, E> {
  readonly fromSource: <A>(fa: Source<A>) => Kind2<M, E, A>
}

/**
 * @since 0.1.0
 * @category Type classes
 */
export interface MonadSource3<M extends URIS3> extends MonadTask3<M> {
  readonly fromSource: <R, E, A>(fa: Source<A>) => Kind3<M, R, E, A>
}

/**
 * @since 0.1.0
 * @category Type classes
 */
export interface MonadSource3C<M extends URIS3, E> extends MonadTask3C<M, E> {
  readonly fromSource: <R, A>(fa: Source<A>) => Kind3<M, R, E, A>
}

/**
 * @since 0.6.7
 * @category Type classes
 */
export interface MonadSource4<M extends URIS4> extends MonadTask4<M> {
  readonly fromSource: <S, R, E, A>(fa: Source<A>) => Kind4<M, S, R, E, A>
}
