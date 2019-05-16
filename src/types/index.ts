// temporary type for better code inference and ergonomics
// when defining a new entity.

export interface WithKey<T> {
    key<Key extends string>(key: Key): WithId<T, Key>;
}
export interface WithId<T, Key extends string> {
    id<Id extends string | number | symbol>(
        idGetter: (obj: T) => Id
    ): Entity<T, Key, Id, { [K in Key]: Record<Id, T> }, {}>;
}

export interface Entity<
    T,
    Key extends string,
    Id extends string | number | symbol,
    Entities extends SelfEntities<T, Key, Id>,
    Relations extends {}
> {
    relations: Relations;
    one<
        Prop extends (keyof T) & (keyof Entities[Key][Id]),
        E2 extends Entity<T[Prop], any, any, any, any>
    >(
        prop: Prop,
        entity: E2
    ): NewRelation<T, Key, Id, Entities, Relations, Prop, E2>;
    many<
        Prop extends (keyof T) & (keyof Entities[Key][Id]),
        E2 extends Entity<
            T[Prop] extends any[] ? ExtractArray<T[Prop]> : never,
            any,
            any,
            any,
            any
        >
    >(
        prop: Prop,
        entity: E2
    ): NewRelation<T, Key, Id, Entities, Relations, Prop, E2>;
    normalize(obj: T[]): { entities: Entities; result: Id[] };
}

export type ExtractArray<T extends any[]> = T extends (infer R)[] ? R : never;
export type ArrayProps<T> = {
    [K in keyof T]: T[K] extends any[] ? K : never
}[keyof T];

export type SelfEntities<
    T,
    Key extends string,
    Id extends string | number | symbol
> = { [K in Key]: Record<Id, { [P in keyof T]: any }> };
export type EmptyRelations<Key extends string> = { [K in Key]: {} };

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type ExtractType<E> = E extends Entity<infer T, any, any, any, any> ? T : never;
type ExtractKey<E> = E extends Entity<any, infer Key, any, any, any>
    ? Key
    : never;
type ExtractId<E> = E extends Entity<any, any, infer Id, any, any> ? Id : never;
type ExtractEntities<E> = E extends Entity<any, any, any, infer Entities, any>
    ? Entities
    : never;
// type ExtractRelations<E> = E extends Entity<any, any, any, any, infer Relations>
//     ? Relations
//     : never;

type Normalize<
    T,
    Prop extends keyof T,
    E2 extends Entity<any, any, any, any, any>
> = Omit<T, Prop> &
    {
        [K in Prop]: T[Prop] extends ExtractType<E2>[]
            ? ExtractId<E2>[]
            : ExtractId<E2>
    };

export type NewRelation<
    T,
    Key extends string,
    Id extends string | number | symbol,
    Entities extends SelfEntities<T, Key, Id>,
    Relations extends {},
    Prop extends (keyof T) & (keyof Entities[Key][Id]),
    E2 extends Entity<any, any, any, any, any>
> = Entity<
    T,
    Key,
    Id,
    AddToEntities<T, Key, Id, Entities, Prop, E2>,
    AddToRelations<Relations, Prop, E2>
>;

export type AddToEntities<
    T,
    Key extends string,
    Id extends string | number | symbol,
    Entities extends SelfEntities<T, Key, Id>,
    Prop extends (keyof T) & keyof Entities[Key][Id],
    E2 extends Entity<any, any, any, any, any>
> = Omit<Entities, Key> &
    { [K in Key]: Record<Id, Normalize<Entities[Key][Id], Prop, E2>> } &
    ExtractEntities<E2>;

export type AddToRelations<
    Relations,
    Prop extends string | number | symbol,
    E2 extends Entity<any, any, any, any, any>
> = Relations & { [K in Prop]: E2 };

export type TypeOf<E extends Entity<any, any, any, any, any>> = ExtractEntities<
    E
>[ExtractKey<E>][ExtractId<E>];
