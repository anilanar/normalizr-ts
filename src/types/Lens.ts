export interface Lens<S, A, B, T> {
    get(s: S): A;
    set(s: S, a: B): T;
}

export const lens = <S, A, B, T>(
    get: (s: S) => A,
    set: (s: S, a: B) => T
): Lens<S, A, B, T> => ({
    get,
    set
});
