import { En, I, J } from "./Entity";
import { relation } from "./relation";
import { lens } from "./Lens";
import { nullable, Nullable, wrap, unwrap, Nil } from "./Nullable";

type One<
    A_ extends { [K in P]?: A$ | null | undefined },
    A$,
    B$,
    P extends keyof A_
> = Omit<A_, P> & { [K in P]: Exclude<A_[P], A$> | B$ };

export const one = <
    P extends keyof A_,
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
    type Nil = Exclude<A_[P], A$>;
    const nilRelation = relation(nullable);
    const propLens = lens<
        A_,
        Nullable<Nil, A$>,
        Nullable<Nil, B$>,
        One<A_, A$, B$, P>
    >(
        a => wrap<Nil, A$>(a[prop] as A$ | Nil),
        (a, id) => ({
            ...a,
            [prop]: unwrap(id)
        })
    );
    return nilRelation(propLens, e2);
};
