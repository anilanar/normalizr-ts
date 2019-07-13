// import { Newtype, iso } from "newtype-ts";
import { Functor1, Functor2, Functor2C } from "fp-ts/es6/Functor";
import { HKT, URIS, Kind } from "fp-ts/es6/HKT";
import { flow } from "fp-ts/es6/function";
import { fromNullable, map, option, toNullable } from "fp-ts/es6/Option";
import { Foldable1, Foldable2, Foldable2C } from "fp-ts/es6/Foldable";

// const URI_: unique symbol = Symbol();
// const URI = ({ Nullable: URI_ } as unknown) as URI;
// type URI = { readonly Nullable: unique symbol };

declare module "fp-ts/es6/HKT" {
    interface URItoKind2<E, A> {
        Nullable: Nullable<E, A>;
    }
}

// interface Newtype<F> {
//     readonly _URI: F;
//     readonly wrap: <A>(a: A) => HKT<F, A>;
//     readonly unwrap: <A>(a: HKT<F, A>) => A;
// }

// export interface Newtype1<F extends URIS> {
//     readonly URI: F;
//     readonly wrap: <A>(a: A) => Kind<F, A>;
//     readonly unwrap: <A>(a: Kind<F, A>) => A;
// }

// export interface Nullable<T>
//     extends Newtype<
//         { readonly Nullable: unique symbol },
//         T | null | undefined
//     > {}

const URI = "Nullable";
type URI = typeof URI;

/**
 * `N` represents the null type.
 */
export class Nullable<N, T> {
    private _A: T | N;
    private constructor(a: T | N) {
        this._A = a;
    }
}

const unsafeCoerce = <R>(a: unknown): R => a as R;
export const wrap: <N extends null | undefined, A>(
    a: A | N
) => Nullable<N, A> = unsafeCoerce;
export const unwrap: <N extends null | undefined, A>(
    a: Nullable<N, A>
) => A | N = unsafeCoerce;
const toOption = flow(
    unwrap,
    fromNullable
);
const fromOption = flow(
    toNullable,
    wrap
);

export type Nil = null | undefined;
/**
 * Functor and Foldable instances for Nullable Nil
 */
export const nullable: Functor2C<URI, Nil> & Foldable2C<URI, Nil> = {
    URI,
    _E: undefined,
    map: <A, B>(fa: Nullable<Nil, A>, f: (a: A) => B) => {
        const u = unwrap(fa);
        return u == null ? wrap<Nil, B>(u as Nil) : wrap(f(u));
    },
    reduce: (fa, b, f) => {
        const u = unwrap(fa);
        return u == null ? b : f(b, u);
    },
    reduceRight: (fa, b, f) => {
        const u = unwrap(fa);
        return u == null ? b : f(u, b);
    },
    foldMap: M => (fa, f) => {
        const u = unwrap(fa);
        return u == null ? M.empty : f(u);
    }
};
