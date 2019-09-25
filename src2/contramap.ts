import { En, J, I, en } from "./Entity";

export const contramap = <A, A$>(f: (b: A$) => A) => <
    B extends J,
    C extends I,
    A_,
    T extends {}
>(
    en1: En<A, B, C, A_, T>
): En<A$, B, C, A_, T> => en(en1._key, a => en1.normalize(f(a)), en1.empty);
