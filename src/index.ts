import {
    TypeOf,
    WithKey,
    WithId,
    Entity,
    NewRelation,
    ArrayProps,
    ExtractArray,
    SelfEntities
} from "./types";

class EntityImpl<
    T,
    Key extends string,
    Id extends string | number | symbol,
    Entities extends SelfEntities<T, Key, Id>,
    Relations extends {}
> implements Entity<T, Key, Id, Entities, Relations> {
    relations = {} as Relations;
    one<
        Prop extends (keyof T) & (keyof Entities[Key][Id]),
        E2 extends Entity<T[Prop], any, any, any, any>
    >(
        prop: Prop,
        entity: E2
    ): NewRelation<T, Key, Id, Entities, Relations, Prop, E2> {
        return null as any;
    }

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
    ): NewRelation<T, Key, Id, Entities, Relations, Prop, E2> {
        return null as any;
    }
    normalize(obj: T[]): { entities: Entities; result: Id[] } {
        return null as any;
    }
}

class WithIdImpl<T, Key extends string> implements WithId<T, Key> {
    constructor(private key: Key) {}
    id<Id extends string | number | symbol>(
        idGetter: (obj: T) => Id
    ): Entity<T, Key, Id, { [K in Key]: Record<Id, T> }, {}> {
        const cls = new EntityImpl<
            T,
            Key,
            Id,
            { [K in Key]: Record<Id, T> },
            { [K in Key]: {} }
        >();
        return {
            relations: {},
            one: cls.one.bind(cls),
            many: cls.many.bind(cls),
            normalize: cls.normalize.bind(cls)
        };
    }
}

class WithKeyImpl<T> implements WithKey<T> {
    key<Key extends string>(key: Key): WithId<T, Key> {
        const cls = new WithIdImpl<T, Key>(key);
        return {
            id: cls.id.bind(cls)
        };
    }
}

export function define<T>(): WithKey<T> {
    const cls = new WithKeyImpl<T>();
    return {
        key: cls.key.bind(cls)
    };
}

export { TypeOf };
