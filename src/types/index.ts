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
        T2 extends ValidT<IdProp2>,
        IdProp2 extends ValidIdProp<T2>,
        Key2 extends string,
        Entities2 extends SelfEntities<T2, Key2, IdProp2>
    >(
        prop: Entities[Key][T[IdProp]][Prop] extends T[Prop]
            ? Exclude<Prop, IdProp>
            : never,
        entity: Exclude<
            Entities[Key][T[IdProp]][Prop],
            undefined | null
        > extends T2
            ? Entity<T2, Key2, IdProp2, Entities2>
            : never
    ): NewRelation<T, Key, IdProp, Entities, Prop, Entities2, T2[IdProp2]>;

    many<
        Prop extends Exclude<
            (keyof T) & (keyof Entities[Key][T[IdProp]]),
            IdProp
        >,
        T2 extends ValidT<IdProp2>,
        IdProp2 extends ValidIdProp<T2>,
        Key2 extends string,
        Entities2 extends SelfEntities<T2, Key2, IdProp2>
    >(
        prop: Entities[Key][T[IdProp]][Prop] extends T[Prop]
            ? Exclude<Prop, IdProp>
            : never,
        entity: Exclude<T[Prop], null | undefined> extends T2[]
            ? Entity<T2, Key2, IdProp2, Entities2>
            : never
    ): NewRelation<
        T,
        Key,
        IdProp,
        Entities,
        Prop,
        Entities2,
        T2[IdProp2][] | Exclude<T[Prop], T2[]>
    >;
    normalizeOne(obj: T): { entities: Entities; result: T[IdProp] };
    normalize(obj: T[]): { entities: Entities; result: T[IdProp][] };
    empty(): { entities: Entities };
}

export type SelfEntities<
    T extends ValidT<IdProp>,
    Key extends string,
    IdProp extends ValidIdProp<T>
> = {
    [K in Key]: Record<
        T[IdProp],
        { [P in Exclude<keyof T, IdProp>]?: unknown } & { [K in IdProp]: T[K] }
    >;
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
export type ExtractIdProp<E> = E extends Entity<
    infer _T,
    any,
    infer IdProp,
    any
>
    ? IdProp
    : never;
export type ExtractId<E> = ExtractType<E>[ExtractIdProp<E>];
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
        >;
    };

export type TypeOf<E> = ExtractEntities<E>[ExtractKey<E>][ExtractId<E>];

type UnboxArray<T> = T extends (infer R)[] ? R : never;
