import fc, { Arbitrary } from "fast-check";
import { normalize } from "normalizr";
import R from "ramda";
import * as T from "../mock";
import * as N from "../mock/normalizr";

const RUN_COUNT = 1000;

const authors = fc.set(
    fc.record<T.Author>({
        id: fc.integer(),
        name: fc.string()
    }),
    1,
    10,
    (a, b) => a.id === b.id
);
const books = fc.set(
    fc.record<T.Book>({
        author: fc.option(pickOne(authors)),
        authors: fc.option(pickN(authors, fc.integer(0, 10))),
        date: fc.integer().map(timestamp => new Date(timestamp)),
        isbn: fc.string(1, 10),
        name: fc.string()
    }),
    1,
    10,
    (a, b) => a.isbn === b.isbn
);
const people = fc.set(
    fc.record<T.Person>({
        id: fc.integer(),
        name: fc.string(),
        favoriteBooks: fc
            .option(pickN(books, fc.integer(0, 10)))
            .chain(x =>
                x === null
                    ? fc.oneof(fc.constant(undefined), fc.constant(null))
                    : fc.constant(x)
            ),
        favoriteAuthor: fc
            .option(pickOne(authors))
            .map(x => (x === null ? undefined : x))
    }),
    0,
    10,
    (a, b) => a.id === b.id
);

const users = fc.array(
    fc.record<T.User>({
        id: fc.integer(),
        type: fc.constant("user"),
        name: fc.string()
    }),
    1,
    10
);

const groups = fc.array(
    fc.record<T.Group>({
        id: fc.integer(),
        type: fc.constant("group"),
        users: users.chain(x => fc.subarray(x))
    }),
    1,
    10
);

const candies = fc.array(
    fc.record<T.Candy>({
        id: fc.integer(),
        owner: fc.oneof<T.User | T.Group>(pickOne(users), pickOne(groups))
    }),
    0,
    10
);

it("can normalize authors", () => {
    fc.assert(fc.property(authors, assertAuthors), { numRuns: RUN_COUNT });
});

it("can normalize books", () => {
    fc.assert(fc.property(books, assertBooks), { numRuns: RUN_COUNT });
});

it("can normalize people", () => {
    fc.assert(fc.property(people, assertPeople), { numRuns: RUN_COUNT });
});

it("can normalize candies", () => {
    fc.assert(fc.property(candies, assertCandies), { numRuns: RUN_COUNT });
});

test("case #1", () => {
    assertBooks([
        {
            author: { id: 0, name: "" },
            authors: [],
            date: new Date(0),
            isbn: " ",
            name: ""
        },
        {
            author: { id: 0, name: "" },
            authors: [],
            date: new Date(0),
            isbn: "!",
            name: ""
        }
    ]);
});

test("case #2", () => {
    assertPeople([]);
});

test("case #3", () => {
    assertPeople([
        { id: 0, name: "", favoriteBooks: [], favoriteAuthor: undefined }
    ]);
});

test("case #4", () => {
    assertBooks([
        {
            author: { id: 0, name: "" },
            authors: [],
            date: new Date(0),
            isbn: " ",
            name: ""
        },
        {
            author: { id: 0, name: " " },
            authors: [],
            date: new Date(0),
            isbn: "!",
            name: ""
        }
    ]);
});

test("case #5", () => {
    assertBooks([
        {
            author: { id: 0, name: "" },
            authors: [{ id: -4, name: "" }],
            date: new Date(0),
            isbn: " ",
            name: ""
        },
        {
            author: { id: -4, name: " " },
            authors: [],
            date: new Date(0),
            isbn: "!",
            name: ""
        }
    ]);
});

test("case #6", () => {
    assertBooks([
        { author: null, authors: null, date: new Date(0), isbn: " ", name: "" }
    ]);
});

function assertAuthors(authors: T.Author[]) {
    const resultT = T.author.normalize(authors);
    const resultN = normalize(authors, [N.author]);
    expect(resultT).toEqual(
        R.mergeDeepRight({ entities: { author: {} }, result: [] }, resultN)
    );
}

function assertBooks(books: T.Book[]) {
    const resultT = T.book.normalize(books);
    const resultN = normalize(books, [N.book]);
    expect(resultT).toEqual(
        R.mergeDeepRight(
            { entities: { author: {}, book: {} }, result: [] },
            resultN
        )
    );
}
function assertPeople(people: T.Person[]) {
    const empty = {
        entities: {
            book: {},
            author: {},
            person: {}
        },
        result: []
    };

    const resultT = T.person.normalize(people);
    const resultN = normalize(people, [N.person]);
    expect(resultT).toEqual(R.mergeDeepRight(empty, resultN));
}

function assertCandies(candies: T.Candy[]) {
    const resultT = T.candy.normalize(candies);
    const resultN = normalize(candies, [N.candy]);
    expect(resultT).toEqual(
        R.mergeDeepRight(
            {
                entities: {
                    user: {},
                    group: {},
                    candy: {}
                },
                result: []
            },
            resultN
        )
    );
}

function pickOne<T>(arb: Arbitrary<T[]>): Arbitrary<T> {
    return arb.chain(x => fc.subarray(x, 1, 1).map(x => x[0]));
}

function pickN<T>(
    arb: Arbitrary<T[]>,
    arbN: Arbitrary<number>
): Arbitrary<T[]> {
    return fc
        .tuple(arb, arbN)
        .chain(([arr, n]) => fc.subarray(arr, 0, Math.min(n, arr.length)));
}
