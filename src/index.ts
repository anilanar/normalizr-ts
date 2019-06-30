import mergeWith from "@ramda/mergewith";

import {
    TypeOf,
    WithKey,
    Entity,
    NewRelation,
    SelfEntities,
    AddToEntities,
    ValidIdProp,
    ValidT,
    WithId
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
        private _normalizeOne: (
            obj: T
        ) => { entities: Entities; result: T[IdProp] },
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
            item => {
                // const { entities, result } = this._normalize(o);
                type ResultEntities = AddToEntities<
                    T,
                    Key,
                    IdProp,
                    Entities,
                    Prop,
                    Entities2,
                    Result2
                >;

                try {
                    const { entities, result } = this.normalizeOne(item);
                    const normalized = entities[this._key][result];
                    const { entities: entities2, result: result2 } = map(
                        normalized[prop]
                    );
                    const combined = mergeWith(
                        mergeWith((a, b) => ({ ...a, ...b })),
                        entities,
                        entities2
                    );
                    const allEntities: ResultEntities = mergeWith(
                        mergeWith((a, b) => ({ ...a, ...b })),
                        {
                            ...empty().entities,
                            ...this._empty().entities
                        },
                        combined
                    );

                    allEntities[this._key][item[this._idProp]] = {
                        ...normalized,
                        [prop]: result2
                    } as any;

                    return {
                        entities: allEntities,
                        result
                    };
                } catch (e) {
                    console.error(
                        "Failed while converting related entity to its id.\n",
                        `Key: ${this._key}\n`,
                        `Prop: ${prop}\n`,
                        `Val: ${JSON.stringify(item)}\n`
                    );
                    throw e;
                }
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
    ): NewRelation<T, Key, IdProp, Entities, Prop, Entities2, T2[IdProp2]> {
        return this.relation(
            prop as Prop,
            orig => {
                if (orig == null) {
                    return {
                        entities: entity.empty().entities,
                        result: orig
                    };
                }
                const orig_ = (orig as unknown) as T2;
                return entity.normalizeOne(orig_);
            },
            () => entity.empty()
        );
    }

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
    > {
        return this.relation<
            Prop,
            Entities2,
            T2[IdProp2][] | Exclude<T[Prop], T2[]>
        >(
            prop, // Exclude<keyof T & keyof Entities[Key][T[IdProp]], IdProp>,
            orig => {
                if (orig == null) {
                    return {
                        entities: entity.empty().entities,
                        result: orig
                    };
                }
                return entity.normalize((orig as unknown) as T2[]);
            },
            () => entity.empty()
        );
    }

    normalizeOne(obj: T): { entities: Entities; result: T[IdProp] } {
        return this._normalizeOne(obj);
    }

    normalize(items: T[]): { entities: Entities; result: T[IdProp][] } {
        try {
            let entities = { ...this.empty().entities };
            const result = [] as T[IdProp][];
            for (const item of items) {
                const normalized = this.normalizeOne(item);
                entities = mergeWith(
                    mergeWith((_, b) => b),
                    entities,
                    normalized.entities
                );
                result.push(normalized.result);
            }
            return { entities, result };
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
            item => {
                try {
                    return {
                        entities: {
                            [key as Key]: {
                                [item[this._idProp]]: item
                            }
                        } as Record<Key, Record<T[IdProp], T>>,
                        result: item[this._idProp]
                    };
                } catch (e) {
                    console.error(
                        "Failed while converting related property value to its id.\n",
                        `Key: ${key}\n`,
                        `Val: ${JSON.stringify(item)}\n`,
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

export { TypeOf };
