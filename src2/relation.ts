import { HKT, URIS2, Kind2 } from "fp-ts/es6/HKT";
import { URIS, Kind } from "fp-ts/es6/HKT";
import { Functor1, Functor, Functor2C } from "fp-ts/es6/Functor";
import { Foldable1, Foldable, Foldable2C } from "fp-ts/es6/Foldable";
import { En, I, J, Ap, N, en, unE } from "./Entity";
import { Lens } from "./Lens";

type Out<
    A,
    B extends J,
    C extends I,
    A_,
    T extends {},
    _A$,
    B$ extends J,
    C$ extends I,
    A$_,
    T$,
    R_
> = En<A, B, C, R_, Ap<N<C$, B$, A$_, T$>, N<C, B, A_, T>>>;

type RelationImpl<F> = <
    A_,
    A$,
    B$ extends J,
    C$ extends I,
    A$_,
    T$ extends {},
    R_
>(
    lens: Lens<A_, HKT<F, A$>, HKT<F, B$>, R_>,
    e2: En<A$, B$, C$, A$_, T$>
) => <A, B extends J, C extends I, T>(
    e1: En<A, B, C, A_, T>
) => Out<A, B, C, A_, T, A$, B$, C$, A$_, T$, R_>;

type RelationImpl1<F extends URIS> = <
    A_,
    A$,
    B$ extends J,
    C$ extends I,
    A$_,
    T$ extends {},
    R_
>(
    lens: Lens<A_, Kind<F, A$>, Kind<F, B$>, R_>,
    e2: En<A$, B$, C$, A$_, T$>
) => <A, B extends J, C extends I, T>(
    e1: En<A, B, C, A_, T>
) => Out<A, B, C, A_, T, A$, B$, C$, A$_, T$, R_>;

type RelationImpl2C<F extends URIS2, E> = <
    A_,
    A$,
    B$ extends J,
    C$ extends I,
    A$_,
    T$ extends {},
    R_
>(
    lens: Lens<A_, Kind2<F, E, A$>, Kind2<F, E, B$>, R_>,
    e2: En<A$, B$, C$, A$_, T$>
) => <A, B extends J, C extends I, T>(
    e1: En<A, B, C, A_, T>
) => Out<A, B, C, A_, T, A$, B$, C$, A$_, T$, R_>;

export function relation<F>(F: Functor<F> & Foldable<F>): RelationImpl<F>;
export function relation<F extends URIS>(
    F: Functor1<F> & Foldable1<F>
): RelationImpl1<F>;
export function relation<F extends URIS2, E>(
    F: Functor2C<F, E> & Foldable2C<F, E>
): RelationImpl2C<F, E>;
export function relation<F>(F: Functor<F> & Foldable<F>): RelationImpl<F> {
    return (lens, e2) => e1 =>
        en(
            e1._key,
            a => {
                const { entities: en1, result: r1 } = e1.normalize(a);
                const fr = F.map(lens.get(en1[e1._key][r1]), e2.normalize);
                const fen2 = F.map(fr, x => x.entities);
                const en2 = F.reduce(fen2, e2.empty, (acc, entities) => ({
                    ...acc,
                    entities
                }));
                const r_ = lens.set(
                    en1[e1._key][r1],
                    F.map(fr, ({ result }) => result)
                );

                return {
                    entities: {
                        ...en1,
                        ...en2,
                        [e1._key]: {
                            [r1]: r_
                        }
                    },
                    result: r1
                };
            },
            unE(e1, e2)
        );
}
