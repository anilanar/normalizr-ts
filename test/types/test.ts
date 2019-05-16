import { define, TypeOf } from "../../src/index";

type AssertEqual<A, B> = A extends B ? (B extends A ? true : false) : false;

// Setup
interface Person {
    id: number;
    name: string;
}
interface Author extends Person {
    spouse?: Person;
}
interface Book {
    isbn: string;
    name: string;
    date: Date;
    author: Author;
    authors: Author[];
}

const person = define<Person>()
    .key("person")
    .id(p => p.id);

const author = define<Author>()
    .key("author")
    .id(author => author.id)
    .one("spouse", person);

const book = define<Book>()
    .key("book")
    .id(b => b.isbn)
    .one("author", author)
    .many("authors", author);

// $ExpectType true
type Normalized_type_relationless = AssertEqual<
    { id: number; name: string },
    TypeOf<typeof person>
>;

// $ExpectType true
type Normalized_type_one = AssertEqual<
    { id: number; name: string; spouse?: number },
    TypeOf<typeof author>
>;

// $ExpectType true
type Normalized_type_optional_one = AssertEqual<
    { id: number; name: string; spouse?: number },
    TypeOf<typeof author>
>;

// $ExpectType true
type Normalized_type_one_and_many = AssertEqual<
    {
        isbn: string;
        name: string;
        date: Date;
        author: number;
        authors: number[];
    },
    TypeOf<typeof book>
>;

const normalized = book.normalize(({} as any) as Book[]);

// $ExpectType true
type Normalize_complex_entity = AssertEqual<
    {
        entities: {
            person: Record<number, Person>;
            author: Record<number, Person & { spouse?: number }>;
            book: Record<
                string,
                {
                    isbn: string;
                    name: string;
                    date: Date;
                    author: number;
                    authors: number[];
                }
            >;
        };
        result: string[];
    },
    typeof normalized
>;

// $ExpectType true
type Relations_of_complex_entity = AssertEqual<
    { author: typeof author; authors: typeof author },
    typeof book.relations
>;
