import { identity } from "fp-ts/es6/Identity";
import { En, I, J } from "./Entity";
import { relation } from "./relation";
import { lens } from "./Lens";

type One<
    A_ extends { [K in P]?: A$ | null | undefined },
    A$,
    B$,
    P extends keyof A_
> = Omit<A_, P> & { [K in P]: Exclude<A_[P], A$> | B$ };

export const one = <
    P extends I,
    A_ extends { [K in P]?: A$ | null | undefined },
    A$,
    B$ extends J,
    C$ extends I,
    A$_,
    U extends {}
>(
    prop: P,
    e2: En<A$, B$, C$, A$_, U>
) => {
    const idRelation = relation(identity);
    const propLens = lens<
        A_,
        A$ | null | undefined,
        Exclude<A_[P], A$> & B$,
        One<A_, A$, B$, P>
    >(
        a => a[prop],
        (a, id) => ({
            ...a,
            [prop]: id
        })
    );
    return idRelation(propLens, e2);
};
