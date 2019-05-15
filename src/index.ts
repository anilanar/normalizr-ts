interface Entity<
  T,
  EKey extends string,
  IdType extends string | number,
  Set extends SelfSet<EKey>
> {
  one<Prop extends keyof T, E2 extends Entity<T[Prop], any, any, any>>(
    prop: Prop,
    entity: E2
  ): AddRelation<T, EKey, IdType, Set, Prop, E2>;
  many<
    Prop extends ArrayProps<T>,
    E2 extends Entity<
      T[Prop] extends any[] ? ExtractArray<T[Prop]> : never,
      any,
      any,
      any
    >
  >(
    prop: Prop,
    entity: E2
  ): AddRelation<T, EKey, IdType, Set, Prop, E2>;
  normalize(obj: T[]): { entities: Set; result: IdType[] };
}

type ExtractArray<T extends any[]> = T extends (infer R)[] ? R : never;
type IndexableProps<T> = {
  [K in keyof T]: T[K] extends (string | number) ? K : never
}[keyof T];
type ArrayProps<T> = {
  [K in keyof T]: T[K] extends any[] ? K : never
}[keyof T];

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type SelfSet<EKey extends string> = { [K in EKey]: Record<string, any> };
type ExtractType<E> = E extends Entity<infer T, any, any, any> ? T : never;
type ExtractKey<E> = E extends Entity<any, infer EKey, any, any> ? EKey : never;
type ExtractIdType<E> = E extends Entity<any, any, infer IdType, any>
  ? IdType
  : never;
type ExtractSet<E> = E extends Entity<any, any, any, infer Set> ? Set : never;

type RecordKey<R extends Record<any, any>> = R extends Record<infer K, any>
  ? K
  : never;
type RecordValue<R extends Record<any, any>> = R extends Record<any, infer V>
  ? V
  : never;

type Normalize<
  E1 extends Entity<any, any, any, any>,
  Prop extends keyof ExtractType<E1>,
  E2 extends Entity<any, any, any, any>
> = Omit<ExtractType<E1>, Prop> & { [K in Prop]: ExtractType<E1>[Prop] extends ExtractType<E2>[] ? ExtractIdType<E2>[] : ExtractIdType<E2> };

type AddRelation<
  T,
  EKey extends string,
  IdType extends string | number,
  Set extends SelfSet<EKey>,
  // E1 extends Entity<any, any, any, any>,
  Prop extends keyof T,
  E2 extends Entity<any, any, any, any>
> = Entity<
  T,
  EKey,
  IdType,
  ExtractSet<E2> &
    Omit<Set, EKey> &
    {
      [K in EKey]: Record<
        IdType,
        Normalize<Entity<T, EKey, IdType, Set>, Prop, E2>
      >
    }
>;
// type ToNormalized<E> = Omit<ExtractType<E>, keyof ExtractSet<E> & keyof ExtractType<E>>
// type Normalize<E> = { entities: ExtractSet<E>, result: ExtractIdType<E>[] }

type TypeOf<E extends Entity<any, any, any, any>> = ExtractSet<E>[ExtractKey<
  E
>][ExtractIdType<E>];

interface OperatorGroup {
  id: number;
  name: string;
}

interface Operator {
  id: number;
  name: string;
  group: OperatorGroup;
}

interface Contact {
  id: string;
  fullName: string;
}

interface Message {
  id: string;
  body: string;
  sentAt: Date;
}

interface Conversation {
  id: string;
  subject: string;
  operator: Operator;
  contact: Contact;
  transcript: Message[];
}

const OperatorGroupE: Entity<
  OperatorGroup,
  "operator_group",
  number,
  { operator_group: Record<number, OperatorGroup> }
> = null as any;

const OperatorE = ((null as any) as Entity<
  Operator,
  "operator",
  number,
  { operator: Record<number, Operator> }
>).one("group", OperatorGroupE);

const ContactE = (null as any) as Entity<
  Contact,
  "contact",
  string,
  { contact: Record<number, Contact> }
>;

const MessageE = (null as any) as Entity<
  Message,
  "message",
  string,
  { message: Record<string, Message> }
>;

const ConversationE = ((null as any) as Entity<
  Conversation,
  "conversation",
  string,
  { conversation: Record<string, Conversation> }
>)
  .one("operator", OperatorE)
  .one("contact", ContactE)
  .many('transcript', MessageE);

const { entities, result } = ConversationE.normalize({} as any as Conversation[]);
const transcript = entities.conversation[''].transcript;

// type Schema<Key, O, I, Set> =
//   | Entity<Key, O, I, Set>
//   | [Entity<Key, O, I, Set>]
//   | UnionSchema
//   | ValuesSchema;
// interface UnionSchema {}
// interface ValuesSchema {}

// class Entity<T, IdProp extends keyof T> {
//   in: T;
//   idProp: IdProp;
//   // private relations: {
//   //   [K in keyof I]?: Schema<unknown, unknown, unknown, unknown>
//   // } = {};
//   // public addRelation<Prop extends keyof I, Set>(prop: Prop, schemaFn: <SKey, SO, SI>(set: Set) => Schema<SKey, SO, SI, Set>): Entity<O, I> {
//   //     this.relations[prop] = schemaFn;
//   //     return this;
//   // }
//   // public map<Out>(fn: (o: O) => Out): Entity<Key, Out, I, Set> {
//   // }
//   // public normalize(): O {

//   // }
//   static define<T, IdProp extends keyof T>(idProp: IdProp): Entity<T, IdProp> {
//     return new Entity();
//   }
// }

// type ExtractArray<T extends any[]> = T extends (infer R)[] ? R : never;
// type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// interface Relation<
//   Source,
//   SourceProp extends (keyof Source),
//   TargetId extends keyof Source[SourceProp]
// > {
//   sourceProp: SourceProp;
//   targetId: TargetId;
//   normalize(
//     source: Source
//   ): Omit<Source, SourceProp> &
//     { [P in SourceProp]: Source[SourceProp][TargetId] };
// }

// interface RelationSet<
//   Source,
//   Set extends { [K in keyof Source]?: Relation<Source, K, any> }
// > {
//   relations: Set;
//   // for every relation in set, modify the prop.
//   normalize(
//     source: Source
//   ): {
//     [K in keyof Source]: (K extends keyof Set ? (Set[K] extends Relation<Source, K, infer X> ? Source[K][X] : never) : Source[K])
//   };
// }

// let yy: RelationSet<DbConversation, { operator: Relation<DbConversation, 'operator', 'name'> }>;
// let zz = yy.normalize({ id: 5 } as any as DbConversation)
// const qq = zz.operator;

// interface EntitySet<Set> {
//   entities: Set;
//   add<Key extends Exclude<string, keyof Set>, T, P extends keyof T>(
//     key: Key extends keyof Set ? never : Key,
//     entity: Entity<T, P>
//   ): EntitySet<Set & { [K in Key]: Entity<T, P> }>;
//   single<
//     Key extends keyof Set,
//     Orig extends Set[Key] extends Entity<infer O, any> ? O : never,
//     Prop extends keyof Orig,
//     Out extends Entity<Orig[Prop], any>
//   >(
//     key: Key,
//     prop: Prop,
//     entitySelector: (entities: Set) => Out
//   ): EntitySet<Set>;
//   array<
//     Key extends keyof Set,
//     Orig extends Set[Key] extends Entity<infer O, any> ? O : never,
//     Prop extends keyof Orig,
//     Out extends Orig[Prop] extends any[]
//       ? Entity<ExtractArray<Orig[Prop]>, any>
//       : never
//     // Entity<Orig[Prop], Orig[Prop]> extends Set[Key>]
//     // Selector extends (Set[Key] extends Entity<Out, infer In> ? Entity<Out, In> : never),
//   >(
//     key: Key,
//     prop: Prop,
//     entitySelector: (entities: Set) => Out
//   ): EntitySet<Set>;
//   // Exclude relation properties from E, add relation keys instead.
//   normalize<E extends Set[keyof Set] extends Entity<infer R, any> ? R : never>(
//     entity: E
//   ): void;
// }

// let x: EntitySet<{}>;

// interface DbOperator {
//   id: number;
//   name: string;
// }

// interface DbConversation {
//   id: number;
//   operator: DbOperator;
//   message: DbMessage[];
// }

// type ExtractArray2<T> = T extends (infer R)[] ? R : T;

// type NormalizedType<T, P extends keyof T> = {
//   [K in keyof T]: K extends P ? (ExtractArray2<T[K]> extends { id: infer Id } ? Id : T[K]) : T[K];
// }

// type X = NormalizedType<DbConversation, 'operator' | 'message'>;

// interface DbMessage {
//   id: string;
//   body: string;
// }

// const set = x
//   .add("operator", Entity.define<DbOperator, "id">("id"))
//   .add("conversation", Entity.define<DbConversation, "id">("id"))
//   .add("message", Entity.define<DbMessage, "id">("id"))
//   .single("conversation", "operator", e => e.operator)
//   .array("conversation", "message", e => e.message);

// const res = set.normalize({ id: "str", body: "str" } as DbMessage);
