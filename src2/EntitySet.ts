import { empty, getMonoid } from "fp-ts/lib/Record";
import { Monoid, getStructMonoid } from "fp-ts/lib/Monoid";
import { pipe } from "fp-ts/lib/pipeable";
import { string } from "parsimmon";
import { getStructSemigroup, Semigroup } from "fp-ts/lib/Semigroup";

type EntitySet = { [K in string]: {} };
type Union<K extends string, P extends {}, R extends {}> = {
    [X in K]: P & R;
};

function concat1<K extends string, P extends {}, R extends {}>(
    p: Record<K, P>,
    r: Record<K, R>
): Union<K, P, R> {
    const result: Union<K, P, R> = {} as Union<K, P, R>;
    for (let k in p) {
        const p$ = p[k];
        const r$ = r[k];
        result[k] = { ...p$, ...r$ };
    }
    return result;
}

const URI = "L1";
type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
    export interface URItoKind2<E, A> {
        L1: L1<E, A>;
    }
    export interface URItoKind3<R, E, A> {
        L1: L2<R, E, A>;
    }
}

getStructSemigroup;
const xx = <A>(M: Semigroup<A>) => getStructMonoid({ a: getMonoid(M) });

export const l1: Monoid;

class L1<B, A> {}
class L2<C, B, A> {}
