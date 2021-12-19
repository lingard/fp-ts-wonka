import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'

export function run<A>(eff: TE.TaskEither<Error, A>): void {
  eff()
    .then(
      E.fold(
        (e) => {
          throw e
        },
        () => {
          process.exitCode = 0
        }
      )
    )
    .catch((e) => {
      console.error(e) // tslint:disable-line no-console

      process.exitCode = 1
    })
}
