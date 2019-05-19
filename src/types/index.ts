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
    entityKeys: { [K in keyof Entities]: true };
    relations: Relations;
    one<
        Prop extends (keyof T) & (keyof Entities[Key][Id]),
        T2 extends T[Prop],
        Key2 extends string,
        Id2 extends string | number | symbol,
        Entities2 extends SelfEntities<T2, Key2, Id2>,
        Relations2 extends {},
    >(
        prop: Prop,
        entity: Entity<T2, Key2, Id2, Entities2, Relations2>,
    ): NewRelation<T, Key, Id, Entities, Relations, Prop, 'normal', T2, Key2, Id2, Entities2, Relations2>;

    many<
        Prop extends (keyof T) & (keyof Entities[Key][Id]),
        T2 extends ExtractArray<T[Prop]>,
        Key2 extends string,
        Id2 extends string | number | symbol,
        Entities2 extends SelfEntities<T2, Key2, Id2>,
        Relations2 extends {},
    >(
        prop: Prop,
        entity: Entity<T2, Key2, Id2, Entities2, Relations2>,
    ): NewRelation<T, Key, Id, Entities, Relations, Prop, 'array', T2, Key2, Id2, Entities2, Relations2>;
    normalize(obj: T[]): { entities: Entities; result: Id[] };
}

export type ExtractArray<T> = T extends (infer R)[] ? R : never;
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

type RelationType = 'normal' | 'array' | 'map' | 'union';

type NormalizeOne<
    T,
    Prop extends keyof T,
    Id2 extends string | number | symbol
> = Omit<T, Prop> & { [K in Prop]: Id2 };

type NormalizeMany<
    T,
    Prop extends keyof T,
    Id2 extends string | number | symbol
> = Omit<T, Prop> & { [K in Prop]: Id2[] };

export type NewRelation<
    T,
    Key extends string,
    Id extends string | number | symbol,
    Entities extends SelfEntities<T, Key, Id>,
    Relations extends {},
    Prop extends (keyof T) & (keyof Entities[Key][Id]),
    RType extends RelationType,
    T2 extends T[Prop],
    Key2 extends string,
    Id2 extends string | number | symbol,
    Entities2 extends SelfEntities<T2, Key2, Id2>,
    Relations2 extends {},
> = Entity<
    T,
    Key,
    Id,
    AddToEntities<T, Key, Id, Entities, Prop, T2, Key2, Id2, Entities2>,
    AddToRelations<Relations, Prop, T2, Key2, Id2, Entities2, Relations2>
>;

export type NewManyRelation<
    T,
    Key extends string,
    Id extends string | number | symbol,
    Entities extends SelfEntities<T, Key, Id>,
    Relations extends {},
    Prop extends (keyof T) & (keyof Entities[Key][Id]),
    T2 extends ExtractArray<T[Prop]>,
    Key2 extends string,
    Id2 extends string | number | symbol,
    Entities2 extends SelfEntities<T2, Key2, Id2>,
    Relations2 extends {},
> = Entity<
    T,
    Key,
    Id,
    AddToEntities<T, Key, Id, Entities, Prop, T2, Key2, Id2, Entities2>,
    AddToRelations<Relations, Prop, T2, Key2, Id2, Entities2, Relations2>
>;

export type AddToEntities<
    T,
    Key extends string,
    Id extends string | number | symbol,
    Entities extends SelfEntities<T, Key, Id>,
    Prop extends (keyof T) & keyof Entities[Key][Id],
    T2,
    Key2 extends string,
    Id2 extends string | number | symbol,
    Entities2 extends SelfEntities<T2, Key2, Id2>,
> = Omit<Entities, Key> &
    {
        [K in Key]: Record<Id, Normalize<Entities[Key][Id], Prop, T2, Id2>>
    } &
    Entities2;

export type AddToRelations<
    Relations,
    Prop extends string | number | symbol,
    T2,
    Key2 extends string,
    Id2 extends string | number | symbol,
    Entities2 extends SelfEntities<T2, Key2, Id2>,
    Relations2 extends {},
> = Relations & { [K in Prop]: Entity<T2, Key2, Id2, Entities2, Relations2> };

export type TypeOf<E extends Entity<any, any, any, any, any>> = ExtractEntities<
    E
>[ExtractKey<E>][ExtractId<E>];
