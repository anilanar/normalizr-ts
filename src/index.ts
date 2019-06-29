import mapValues from "just-map-values";
import mergeDeepWith from "@ramda/mergedeepwith";
import mergeWith from "@ramda/mergewith";

import {
    TypeOf,
    WithKey,
    Entity,
    NewRelation,
    SelfEntities,
    AddToEntities,
    ExtractEntities,
    ExtractId,
    Normalize,
    ExtractType,
    ValidIdProp,
    ValidT,
    WithId,
    ValidId,
    ValidIndex
} from "./types";

class EntityImpl<
    T extends ValidT<IdProp>,
    Key extends string,
    IdProp extends ValidIdProp<T>,
    Entities extends SelfEntities<T, Key, IdProp>
> implements Entity<T, Key, IdProp, Entities> {
    constructor(
        private _key: Key,
        private _idProp: IdProp,
        private _normalize: (
            obj: T[]
        ) => { entities: Entities; result: T[IdProp][] },
        private _empty: () => { entities: Entities }
    ) {}

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
    ): NewRelation<T, Key, IdProp, Entities, Prop, Entities2, Result2> {
        return new EntityImpl(
            this._key,
            this._idProp,
            o => {
                // const { entities, result } = this._normalize(o);
                let allEntities = (Object.assign(
                    {},
                    empty().entities,
                    this._empty().entities
                ) as any) as AddToEntities<
                    T,
                    Key,
                    IdProp,
                    Entities,
                    Prop,
                    Entities2,
                    Result2
                >;
                // const items = result.map(id => entities[this._key][id]);
                const items = o;

                type NormalizedItem = Normalize<
                    Entities[Key][T[IdProp]],
                    IdProp,
                    Prop,
                    Result2
                >;

                for (let i = 0; i < items.length; i++) {
                    // console.log("<<<<<<<<<<<<<<<<<<<<<<", this._key);
                    // console.log("item", prop, items[i]);
                    try {
                        const { entities, result } = this._normalize([
                            items[i]
                        ]);
                        const item = entities[this._key][result[0]];
                        const { entities: entities2, result: result2 } = map(
                            item[prop]
                        );
                        const combined = mergeWith(
                            mergeWith((a, b) => ({ ...a, ...b })),
                            entities,
                            entities2
                        );
                        allEntities = mergeWith(
                            mergeWith((a, b) => ({ ...a, ...b })),
                            allEntities,
                            combined
                        );

                        // console.log("all", allEntities);
                        (allEntities[this._key] as any)[
                            items[i][this._idProp]
                        ] = {
                            ...item,
                            [prop]: result2
                        } as NormalizedItem;
                    } catch (e) {
                        console.error(
                            "Failed while converting related entity to its id.\n",
                            `Key: ${this._key}\n`,
                            `Prop: ${prop}\n`,
                            `Val: ${JSON.stringify(o)}\n`
                        );
                        throw e;
                    }
                    // console.log(">>>>>>>>>>>>>>>>>>>>>>", this._key);
                }

                return {
                    entities: allEntities,
                    result: o.map(i => i[this._idProp])
                };
            },
            () =>
                mergeWith(mergeWith(a => a), empty(), this._empty()) as {
                    entities: AddToEntities<
                        T,
                        Key,
                        IdProp,
                        Entities,
                        Prop,
                        Entities2,
                        Result2
                    >;
                }
        );
    }

    one<
        Prop extends Exclude<
            (keyof T) & (keyof Entities[Key][T[IdProp]]),
            IdProp
        >,
        E2 extends Entity<any, any, any, any>
    >(
        prop: Entities[Key][T[IdProp]][Prop] extends T[Prop] ? Prop : never,
        entity: E2
    ): NewRelation<
        T,
        Key,
        IdProp,
        Entities,
        Prop,
        ExtractEntities<E2>,
        ExtractId<E2>
    > {
        return this.relation(
            prop as Prop,
            orig => {
                if (orig === undefined) {
                    const { entities, result } = entity.normalize([]);
                    return {
                        entities,
                        result: result[0]
                    };
                }
                const { entities, result } = entity.normalize([orig]);
                return {
                    entities,
                    result: result[0]
                };
            },
            () => entity.empty()
        );
    }

    many<
        Prop extends Exclude<
            (keyof T) & (keyof Entities[Key][T[IdProp]]),
            IdProp
        >,
        E2 extends Entity<any, any, any, any>
    >(
        prop: Entities[Key][T[IdProp]][Prop] extends ExtractType<E2>[]
            ? (Entities[Key][T[IdProp]][Prop] extends T[Prop] ? Prop : never)
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
    > {
        return this.relation<Prop, ExtractEntities<E2>, ExtractId<E2>[]>(
            prop,
            orig =>
                entity.normalize((orig as unknown) as any[]) as {
                    entities: ExtractEntities<E2>;
                    result: ExtractId<E2>[];
                },
            () => entity.empty()
        );
    }

    normalize(obj: T[]): { entities: Entities; result: T[IdProp][] } {
        try {
            return this._normalize(obj);
        } catch (e) {
            console.error(`Failed while normalizing entity ${this._key}.`);
            throw e;
        }
    }

    empty(): { entities: Entities } {
        return this._empty();
    }
}

class WithIdImpl<T> implements WithId<T> {
    id<IdProp extends ValidIdProp<T>>(
        prop: T extends ValidT<IdProp> ? IdProp : never
    ): T extends ValidT<IdProp> ? WithKey<T, IdProp> : never {
        return new WithKeyImpl<any, any>(prop) as any;
    }
}

class WithKeyImpl<T extends ValidT<IdProp>, IdProp extends ValidIdProp<T>>
    implements WithKey<T, IdProp> {
    constructor(private _idProp: IdProp) {}
    key<Key extends string>(
        key: Key
    ): Entity<T, Key, IdProp, { [K in Key]: Record<T[IdProp], T> }> {
        return new EntityImpl(
            key,
            this._idProp,
            o => {
                try {
                    return {
                        entities: {
                            [key as Key]: toDict(o, this._idProp)
                        } as Record<Key, Record<T[IdProp], T>>,
                        result: o.map(i => i[this._idProp])
                    };
                } catch (e) {
                    console.error(
                        "Failed while converting related property value to its id.\n",
                        `Key: ${key}\n`,
                        `Val: ${JSON.stringify(o)}\n`,
                        `Id prop: ${this._idProp}\n`
                    );
                    throw e;
                }
            },
            () => ({
                entities: { [key]: {} } as Record<Key, Record<T[IdProp], T>>
            })
        );
    }
}

export function define<T>(): WithId<T> {
    return new WithIdImpl();
}

function toDict<T extends ValidT<IdProp>, IdProp extends ValidIdProp<T>>(
    a: T[],
    idProp: IdProp
): Record<T[IdProp], T> {
    const res = {} as Record<T[IdProp], T>;
    for (let i = 0; i < a.length; i++) {
        res[a[i][idProp]] = a[i];
    }
    return res;
}

function doIt<
    T extends ValidT<IdProp>,
    Key extends ValidIndex,
    IdProp extends ValidIdProp<T>
>(items: T[], idProp: IdProp, key: Key) {
    return {
        [key]: toDict(items, idProp)
    };
}

const debug = <T>(x: T): T => {
    console.log(x);
    return x;
};

export { TypeOf };
