import { TypeOf } from "../../src/index";
import { book, author, person, Person } from "../../mock/index";

type AssertEqual<A, B> = A extends B ? (B extends A ? true : false) : false;

// $ExpectType true
type Normalized_type_relationless = AssertEqual<
    { id: number; name: string },
    TypeOf<typeof author>
>;

// $ExpectType true
type Normalized_type_one_and_many1 = AssertEqual<
    {
        id: number;
        name: string;
        favoriteBooks: string[];
        favoriteAuthor?: number;
    },
    TypeOf<typeof person>
>;

// $ExpectType true
type Normalized_type_one_and_many2 = AssertEqual<
    {
        isbn: string;
        name: string;
        date: Date;
        author: number;
        authors: number[];
    },
    TypeOf<typeof book>
>;

const normalized = person.normalize(({} as unknown) as Person[]);

// $ExpectType true
type Normalize_complex_entity = AssertEqual<
    {
        entities: {
            author: Record<number, TypeOf<typeof author>>;
            person: Record<number, TypeOf<typeof person>>;
            book: Record<string, TypeOf<typeof book>>;
        };
        result: number[];
    },
    typeof normalized
>;
