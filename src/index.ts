import { Schema, normalize, schema } from "normalizr";
import map from "just-map-values";

import {
    TypeOf,
    WithKey,
    WithId,
    Entity,
    NewRelation,
    ExtractArray,
    SelfEntities,
    AddToEntities
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
        public entityKeys: { [K in keyof Entities]: true },
        public relations: Relations
    ) { }

    one<
        Prop extends (keyof T) & (keyof Entities[Key][Id]),
        T2 extends T[Prop],
        Key2 extends string,
        Id2 extends string | number | symbol,
        Entities2 extends SelfEntities<T2, Key2, Id2>,
        Relations2 extends {}
    >(
        prop: Prop,
        entity: Entity<T2, Key2, Id2, Entities2, Relations2>
    ): NewRelation<
        T,
        Key,
        Id,
        Entities,
        Relations,
        Prop,
        T2,
        Key2,
        Id2,
        Entities2,
        Relations2
    > {
        const newRelation = { [prop]: entity } as {
            [P in Prop]: Entity<T2, Key2, Id2, Entities2, Relations2>
        };
        const newEntityKeys = {
            ...this.entityKeys,
            ...entity.entityKeys
        };
        const newRelations = {
            ...this.relations,
            ...newRelation
        };

        return new EntityImpl<
            T,
            Key,
            Id,
            AddToEntities<T, Key, Id, Entities, Prop, T2, Key2, Id2, Entities2>,
            typeof newRelations
        >(this.key, this.idGetter, newEntityKeys, {
            ...this.relations,
            ...newRelation
        });
    }

    many<
        Prop extends (keyof T) & (keyof Entities[Key][Id]),
        T2 extends ExtractArray<T[Prop]>,
        Key2 extends string,
        Id2 extends string | number | symbol,
        Entities2 extends SelfEntities<T2, Key2, Id2>,
        Relations2 extends {}
    >(
        prop: Prop,
        entity: Entity<T2, Key2, Id2, Entities2, Relations2>
    ): NewRelation<
        T,
        Key,
        Id,
        Entities,
        Relations,
        Prop,
        T2,
        Key2,
        Id2,
        Entities2,
        Relations2
    > {
        const newRelation = { [prop]: entity } as {
            [P in Prop]: Entity<T2, Key2, Id2, Entities2, Relations2>
        };
        const newEntityKeys = {
            ...this.entityKeys,
            ...entity.entityKeys
        };
        const newRelations = {
            ...this.relations,
            ...newRelation
        };

        return new EntityImpl<
            T,
            Key,
            Id,
            AddToEntities<T, Key, Id, Entities, Prop, T2, Key2, Id2, Entities2>,
            typeof newRelations
        >(this.key, this.idGetter, newEntityKeys, {
            ...this.relations,
            ...newRelation
        });
    }

    normalize(objs: T[]): { entities: Entities; result: Id[] } {
        const results = objs.map(this.idGetter);
        const keys = Object.keys(this.entityKeys) as (keyof Entities)[];
        const entities = keys.reduce(
            (acc, key) => ({
                ...acc,
                [key]: {}
            }),
            {}
        ) as { [K in keyof Entities]: {} };

        const relatedProps = Object.keys(this.relations) as (keyof T &
            keyof Relations)[];

        for (let i = 0; i < relatedProps.length; i++) {
            const prop = relatedProps[i];
            const relatedEntity: any = this.relations[prop];
            for (let j = 0; j < objs.length; j++) {
                const obj = objs[j];
                const related = relatedEntity.normalize([obj[prop]]);
                // how to merge 2 entities? merge strategy?
                // assume we somehow enhanced entities.
                // map(entities, (normalized) => Object.assign(normalized, related.entities));
            }
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
        >(this.key, idGetter, { [this.key]: true } as { [K in Key]: true }, {});

        return {
            entityKeys: cls.entityKeys,
            relations: cls.relations,
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

/**
 * Algorithm:
 * 1) Iterate b
 * 2) if a doesn't have `prop`, `a[prop]` = `b[prop]`;
 * 3) if a has `prop`, merge `b[prop]` into `a[prop]`:
 *  3.a) iterate `b[prop]`
 *  3.b) if `a[prop]` doesn't have `id`, `a[prop][id] = b[prop][id]`
 *  3.c) if `a[prop]` has `id`, `a[prop][id] = merge(a[prop][id], b[prop][id])`
 */
function mergeEntities<E1 extends object, E2 extends object>(a: E1, b: E2): E1 & E2 {
    return null as any;
}

export { TypeOf };
