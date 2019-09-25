import { J, En, I, N } from "./Entity";
import { concat } from "./EntitySet";

export interface Un<A, T extends {}, R extends {}> {
    _tag: "Un";
    normalize(a: A): { entities: T; result: R };
    empty: T;
}

export const un = <A, T extends {}, R extends {}>(
    normalize: (a: A) => { entities: T; result: R },
    empty: T
): Un<A, T, R> => ({
    _tag: "Un",
    normalize,
    empty
});

type Out<
    A,
    B extends J,
    C extends I,
    A_,
    T extends Record<I, unknown>,
    A$,
    B$ extends J,
    C$ extends I,
    A$_,
    T$
> = Un<A | A$, N<C, B, A_, T> & N<C$, B$, A$_, T$>, B | B$>;

export const union = <A, C extends I, A$, B$ extends J, C$ extends I, A$_, T$>(
    e2: En<A$, B$, C$, A$_, T$>,
    is: (a: A | A$) => a is A$
) => <B extends J, A_, T extends {}>(
    e1: En<A, B, C, A_, T>
): Out<A, B, C, A_, T, A$, B$, C$, A$_, T$> =>
    un(
        a => {
            if (!is(a)) {
                const { entities: en, result } = e1.normalize(a as A);
                return {
                    entities: concat(en, e2.empty),
                    result: result as B | B$
                };
            }
            const { entities: en, result } = e2.normalize(a as A$);
            return {
                entities: { ...en, ...e1.empty },
                result: result as B | B$
            };
        },
        { ...e1.empty, ...e2.empty }
    );
