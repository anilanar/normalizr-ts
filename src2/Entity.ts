import { Monoid, getStructMonoid } from "fp-ts/lib/Monoid";
import { Semigroup } from "fp-ts/lib/Semigroup";
import { getMonoid } from "fp-ts/lib/Record";

export type J = string;

export type I = string;

export type Ap<A extends {}, B extends {}> = Omit<A, keyof B> & B;
export type N<C extends I, B extends J, A_, T> = Ap<
    T,
    Record<C, Record<B, A_>>
>;

export interface En<A, B extends J, C extends I, A_, T extends {}> {
    _tag: "En";
    _key: C;
    monoid: Monoid<N<C, B, A_, T>>;
    normalize: (a: A) => { entities: N<C, B, A_, T>; result: B };
    normalizeM: (
        M: Monoid<N<C, B, A_, T>>
    ) => (a: A) => { entities: N<C, B, A_, T>; result: B };
    // empty: N<C, B, A_, T>;
}

export const en = <A, B extends J, C extends I, A_, T extends {}>(
    key: C,
    normalizeM: (
        M: Monoid<N<C, B, A_, T>>
    ) => (a: A) => { entities: N<C, B, A_, T>; result: B },
    monoid: Monoid<N<C, B, A_, T>>
): En<A, B, C, A_, T> => ({
    _tag: "En",
    _key: key,
    normalize: normalizeM(monoid),
    normalizeM,
    monoid
});

export function unE<
    A,
    B extends J,
    C extends I,
    A_,
    T extends {},
    A$,
    B$ extends J,
    C$ extends I,
    A$_,
    U extends {},
    R_
>(
    e1: En<A, B, C, A_, T>,
    e2: En<A$, B$, C$, A$_, U>
): N<C, B, R_, Ap<N<C$, B$, A$_, U>, N<C, B, A_, T>>> {
    return {
        ...e1.monoid.empty,
        ...e2.monoid.empty,
        ...({ [e1._key]: {} } as Record<C, Record<B, R_>>)
    };
}

export const entity = <A, B extends J, C extends I>(
    key: C,
    id: (a: A) => B
) => {
    const normalizeM: (
        M: Monoid<N<C, B, A, {}>>
    ) => (a: A) => { entities: N<C, B, A, {}>; result: B } = M => a => {
        return {
            entities: {
                [key]: {
                    [id(a)]: a
                } as Record<B, A>
            } as Record<C, Record<B, A>>,
            result: id(a)
        };
    };
    const monoid = (getStructMonoid({
        [key as C]: getMonoid({
            concat: (a, b) => ({ ...a, ...b })
        })
    }) as unknown) as Monoid<N<C, B, A, {}>>;
    return en<A, B, C, A, {}>(key, normalizeM, monoid);
};
