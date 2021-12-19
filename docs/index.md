---
title: Home
nav_order: 1
---

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
