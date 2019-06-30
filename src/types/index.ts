export type ValidT<IdProp extends ValidIndex> = Record<IdProp, ValidIndex>;
export type ValidIndex = string | number | symbol;
export type ValidIdProp<T> = ValidIndex & keyof T;

export interface WithId<T> {
    id<IdProp extends ValidIdProp<T>>(
        prop: T extends ValidT<IdProp> ? IdProp : never
    ): T extends ValidT<IdProp> ? WithKey<T, IdProp> : never;
}

export interface WithKey<
    T extends ValidT<IdProp>,
    IdProp extends ValidIdProp<T>
> {
    key<Key extends string>(
        key: Key
    ): Entity<T, Key, IdProp, { [K in Key]: Record<T[IdProp], T> }>;
}

export interface Entity<
    T extends ValidT<IdProp>,
    Key extends string,
    IdProp extends ValidIdProp<T>,
    Entities extends SelfEntities<T, Key, IdProp>
> {
    relation<
        Prop extends Exclude<
            (keyof T) & (keyof Entities[Key][T[IdProp]]),
            IdProp
        >,
        Entities2,
        Result2
    >(
        prop: Prop,
        map: (
            original: Entities[Key][T[IdProp]][Prop]
        ) => { entities: Entities2; result: Result2 },
        empty: () => { entities: Entities2 }
    ): NewRelation<T, Key, IdProp, Entities, Prop, Entities2, Result2>;

    one<
        Prop extends Exclude<
            (keyof T) & (keyof Entities[Key][T[IdProp]]),
            IdProp
        >,
        E2 extends Entity<any, any, any, any>
    >(
        prop: Entities[Key][T[IdProp]][Prop] extends T[Prop]
            ? Exclude<Prop, IdProp>
            : never,
        entity: E2
    ): NewRelation<
        T,
        Key,
        IdProp,
        Entities,
        Prop,
        ExtractEntities<E2>,
        ExtractId<E2>
    >;

    many<
        Prop extends Exclude<
            (keyof T) & (keyof Entities[Key][T[IdProp]]),
            IdProp
        >,
        E2 extends Entity<any, any, any, any>
    >(
        prop: Entities[Key][T[IdProp]][Prop] extends ExtractType<E2>[]
            ? (Entities[Key][T[IdProp]][Prop] extends T[Prop]
                  ? Exclude<Prop, IdProp>
                  : never)
            : never,
        entity: E2
    ): NewRelation<
        T,
        Key,
        IdProp,
        Entities,
        Prop,
        ExtractEntities<E2>,
        ExtractId<E2>[]
    >;
    normalize(obj: T[]): { entities: Entities; result: T[IdProp][] };
    empty(): { entities: Entities };
}

type MapNullable<T1, T2 extends T1, R> = T2 | null | undefined extends T1
    ? R | null | undefined
    : T2 | null extends T1
    ? R | null
    : T2 | undefined extends T1
    ? R | undefined
    : R;

export type SelfEntities<
    T extends ValidT<IdProp>,
    Key extends string,
    IdProp extends ValidIdProp<T>
> = {
    [K in Key]: Record<
        T[IdProp],
        { [P in Exclude<keyof T, IdProp>]?: unknown } & { [K in IdProp]: T[K] }
    >
};

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type ExtractType<E> = E extends Entity<
    infer T,
    infer _A,
    infer _B,
    infer _C
>
    ? T
    : never;
export type ExtractKey<E> = E extends Entity<any, infer Key, any, any>
    ? Key
    : never;
export type ExtractId<E> = E extends Entity<infer T, any, infer IdProp, any>
    ? T[IdProp]
    : never;
export type ExtractEntities<E> = E extends Entity<
    infer _A,
    infer _B,
    infer _C,
    infer Entities
>
    ? Entities
    : never;

export type Normalize<
    T,
    IdProp,
    Prop extends Exclude<keyof T, IdProp>,
    Result
> = Omit<T, Prop> & { [K in keyof Pick<T, Prop>]: Result };

export type NewRelation<
    T extends ValidT<IdProp>,
    Key extends string,
    IdProp extends ValidIdProp<T>,
    Entities extends SelfEntities<T, Key, IdProp>,
    Prop extends Exclude<(keyof T) & keyof Entities[Key][T[IdProp]], IdProp>,
    Entities2,
    Result2
> = Entity<
    T,
    Key,
    IdProp,
    AddToEntities<T, Key, IdProp, Entities, Prop, Entities2, Result2>
>;

export type AddToEntities<
    T extends ValidT<IdProp>,
    Key extends string,
    IdProp extends ValidIdProp<T>,
    Entities extends SelfEntities<T, Key, IdProp>,
    Prop extends Exclude<(keyof T) & keyof Entities[Key][T[IdProp]], IdProp>,
    Entities2,
    Result2
> = Entities2 &
    Omit<Entities, Key> &
    {
        [K in Key]: Record<
            T[IdProp],
            Normalize<Entities[Key][T[IdProp]], IdProp, Prop, Result2>
        >
    };

export type TypeOf<E> = ExtractEntities<E>[ExtractKey<E>][ExtractId<E>];
