import fc, { Arbitrary } from "fast-check";
import { normalize } from "normalizr";
import R from "ramda";
import * as T from "../mock";
import * as N from "../mock/normalizr";

const RUN_COUNT = 1000;

const picture = fc.record<T.Picture>({
    url: fc.webUrl()
});

const users = fc.set(
    fc.record<T.User>({
        id: fc.integer(),
        username: fc.string(),
        realname: fc.string(),
        picture: fc.option(picture).map(x => x || undefined)
    }),
    1,
    10,
    (a, b) => a.id === b.id
);
const messages = fc.set(
    fc.record<T.Message>({
        id: fc.integer(),
        from: pickOne(users),
        to: pickOne(users),
        body: fc.string()
    }),
    0,
    10,
    (a, b) => a.id === b.id
);

const conversations = fc.set(
    fc.record<T.Conversation>({
        id: fc.integer(),
        messages: messages.chain(m => fc.subarray(m))
    }),
    1,
    10
);

it("can normalize users", () => {
    fc.assert(fc.property(users, assertAuthors), { numRuns: RUN_COUNT });
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

function assertUsers(users: T.User[]) {
    const resultT = T.user.normalize(users);
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
