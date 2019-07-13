import { getFunctorComposition, Functor2C } from "fp-ts/es6/Functor";
import { getFoldableComposition } from "./Foldable";
import { nullable, Nullable, Nil } from "./Nullable";
import { array } from "fp-ts/es6/Array";
import { Foldable2C } from "fp-ts/es6/Foldable";

export const URI = "NullableArray";
export type URI = typeof URI;

declare module "fp-ts/es6/HKT" {
    interface URItoKind2<E, A> {
        NullableArray: NullableArray<E, A>;
    }
}

export interface NullableArray<N, A> extends Nullable<N, Array<A>> {}

const functor = getFunctorComposition(nullable, array);
const foldable = getFoldableComposition(nullable, array);

export const nullableArray: Functor2C<URI, Nil> & Foldable2C<URI, Nil> = {
    URI,
    _E: nullable._E,
    ...functor,
    ...foldable
};
