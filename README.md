[fp-ts](https://github.com/gcanti/fp-ts) bindings for [wonka](https://wonka.kitten.sh/)

# Implemented instances

- `Monad`
- `Applicative`
- `Alternative`
- `Filterable`


## Install

Uses `fp-ts` as a peer dependency.

```bash
yarn add fp-ts fp-ts-wonka
```

or

```bash
npm install fp-ts fp-ts-wonka
```

## Example

```ts
import { fromArray } from 'wonka'
import * as S from 'fp-ts-wonka/Source'

const fa = fromArray([1, 2, 3])
const fb = pipe(
  fa,
  S.chain(a => fromArray([a, a + 1])
)
// fb will emit 1, 2, 2, 3, 3, 4
```


## Documentation

- [API Reference](https://lingard.github.io/fp-ts-wonka)

