import {
    TypeOf,
    WithKey,
    WithId,
    Entity,
    NewRelation,
    ExtractArray,
    SelfEntities,
} from "./types";

class EntityImpl<
    T,
    Key extends string,
    Id extends string | number | symbol,
    Entities extends SelfEntities<T, Key, Id>,
    Relations extends {}
> implements Entity<T, Key, Id, Entities, Relations> {
    constructor(
        private key: Key,
        private idGetter: (obj: T) => Id,
        public relations: Relations
    ) {}

    one<
        Prop extends (keyof T) & (keyof Entities[Key][Id]),
        E2 extends Entity<T[Prop], any, any, any, any>
    >(
        prop: Prop,
        entity: E2
    ): NewRelation<T, Key, Id, Entities, Relations, Prop, E2> {
        const appendage = { [prop]: entity } as { [P in Prop]: E2 };
        return new EntityImpl(this.key, this.idGetter, {
            ...this.relations,
            ...appendage
        });
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
        const appendage = { [prop]: entity } as { [P in Prop]: E2 };
        return new EntityImpl(this.key, this.idGetter, {
            ...this.relations,
            ...appendage
        });
    }

    normalize(obj: T[]): { entities: Entities; result: Id[] } {
        const result = obj.map(this.idGetter);
        const entities = {
            // initialize an empty record for each entity?
            // we don't have entities :(
            // back to type proving.
        }
        // iterate obj, if a relation is found, call normalize on its entity
        // which will return { entities, results }. Merge entities into entities.
        // Q: What if multiple properties return the same entities?
        // How to merge them?
        // Check normalzr.
        // if not, keep the prop.
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
            {}
        >(this.key, idGetter, {});
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
