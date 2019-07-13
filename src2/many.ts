import { En, I, J } from "./Entity";
import { relation } from "./relation";
import { lens } from "./Lens";
import { wrap, unwrap } from "./Nullable";
import { nullableArray, NullableArray } from "./NullableArray";

type Many<
    A_ extends { [K in P]?: A$[] | null | undefined },
    A$,
    B$,
    P extends keyof A_
> = Omit<A_, P> & { [K in P]: Exclude<A_[P], A$[]> | B$[] };

export const many = <
    P extends keyof A_,
    A_ extends { [K in P]?: A$[] | null | undefined },
    A$,
    B$ extends J,
    C$ extends I,
    A$_,
    U extends {}
>(
    prop: P,
    e2: En<A$, B$, C$, A$_, U>
) => {
    type Nil = Exclude<A_[P], A$[]>;
    const fRelation = relation(nullableArray);
    const propLens = lens<
        A_,
        NullableArray<Nil, A$>,
        NullableArray<Nil, B$>,
        Many<A_, A$, B$, P>
    >(
        a => wrap<Nil, A$[]>(a[prop] as A$[] | Nil),
        (a, ids) => ({
            ...a,
            [prop]: unwrap<Nil, B$[]>(ids)
        })
    );
    return fRelation(propLens, e2);
};
