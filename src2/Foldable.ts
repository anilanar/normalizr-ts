import { Foldable2C, Foldable1 } from "fp-ts/es6/Foldable";
import { URIS2, URIS, Kind2, Kind } from "fp-ts/es6/HKT";
import { Monoid } from "fp-ts/es6/Monoid";

export interface FoldableComposition2C1<F extends URIS2, G extends URIS, E> {
    readonly reduce: <A, B>(
        fga: Kind2<F, E, Kind<G, A>>,
        b: B,
        f: (b: B, a: A) => B
    ) => B;
    readonly foldMap: <M>(
        M: Monoid<M>
    ) => <A>(fa: Kind2<F, E, Kind<G, A>>, f: (a: A) => M) => M;
    readonly reduceRight: <A, B>(
        fa: Kind2<F, E, Kind<G, A>>,
        b: B,
        f: (a: A, b: B) => B
    ) => B;
}

export function getFoldableComposition<F extends URIS2, G extends URIS, E>(
    F: Foldable2C<F, E>,
    G: Foldable1<G>
): FoldableComposition2C1<F, G, E> {
    return {
        reduce: (fga, b, f) => F.reduce(fga, b, (b, ga) => G.reduce(ga, b, f)),
        foldMap: M => {
            const foldMapF = F.foldMap(M);
            const foldMapG = G.foldMap(M);
            return (fa, f) => foldMapF(fa, ga => foldMapG(ga, f));
        },
        reduceRight: (fa, b, f) =>
            F.reduceRight(fa, b, (ga, b) => G.reduceRight(ga, b, f))
    };
}
