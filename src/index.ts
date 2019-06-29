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
        private _normalize: (
            obj: T[]
        ) => { entities: Entities; result: T[IdProp][] }
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
        ) => { entities: Entities2; result: Result2 }
    ): NewRelation<T, Key, IdProp, Entities, Prop, Entities2, Result2> {
        // return null as any;
        return new EntityImpl(this._key, this._idProp, o => {
            // return null;
            const { entities, result } = this._normalize(o);
            const items = result.map(id => entities[this._key][id]);

            type NormalizedItem = Normalize<
                Entities[Key][T[IdProp]],
                IdProp,
                Prop,
                Result2
            >;

            // const acc = { entities: {}, result };
            const itemsNext = items.map(i => {
                const { result: result2 } = map(i[prop]);
                return { ...i, [prop]: result2 } as NormalizedItem;
            });

            // return null;
            return {
                entities: {
                    [this._key]: itemsNext.reduce(
                        (acc, item) => {
                            const id = (item[
                                (this
                                    ._idProp as unknown) as keyof NormalizedItem
                            ] as unknown) as T[IdProp];
                            acc[id] = item;
                            return acc;
                        },
                        {} as Record<T[IdProp], NormalizedItem>
                    )
                } as AddToEntities<
                    T,
                    Key,
                    IdProp,
                    Entities,
                    Prop,
                    Entities2,
                    Result2
                >,
                result
            };
        });
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
        return this.relation(prop as Prop, orig => entity.normalize([orig]));
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
                }
        );
    }

    normalize(obj: T[]): { entities: Entities; result: T[IdProp][] } {
        return this._normalize(obj);
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
        return new EntityImpl(key, this._idProp, o => ({
            entities: {
                [key as Key]: {
                    [o[0][this._idProp] as T[IdProp]]: o[0]
                } as Record<T[IdProp], T>
            } as Record<Key, Record<T[IdProp], T>>,
            result: o.map(i => i[this._idProp])
        }));
    }
}

export function define<T>(): WithId<T> {
    return new WithIdImpl();
}

// /**
//  * Algorithm:
//  * 1) Iterate b
//  * 2) if a doesn't have `prop`, `a[prop]` = `b[prop]`;
//  * 3) if a has `prop`, merge `b[prop]` into `a[prop]`:
//  *  3.a) iterate `b[prop]`
//  *  3.b) if `a[prop]` doesn't have `id`, `a[prop][id] = b[prop][id]`
//  *  3.c) if `a[prop]` has `id`, `a[prop][id] = merge(a[prop][id], b[prop][id])`
//  */
// function mergeEntities<E1 extends object, E2 extends object>(
//     a: E1,
//     b: E2
// ): E1 & E2 {
//     return null as any;
// }

export { TypeOf };
