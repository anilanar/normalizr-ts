import fc, { Arbitrary, maxSafeNat } from "fast-check";
import { Author, Book, Person, person } from "../mock";

it("works", () => {
    const authors = fc.set(
        fc.record<Author>({
            id: fc.integer(),
            name: fc.string()
        }),
        1,
        10,
        (a, b) => a.id === b.id
    );
    const books = fc.set(
        fc.record<Book>({
            author: pickOne(authors),
            authors: pickN(authors, fc.integer(0, 10)),
            date: fc.integer().map(timestamp => new Date(timestamp)),
            isbn: fc.string(),
            name: fc.string()
        }),
        1,
        10,
        (a, b) => a.isbn === b.isbn
    );
    const people = fc.set(
        fc.record<Person>({
            id: fc.integer(),
            name: fc.string(),
            favoriteBooks: pickN(books, fc.integer(0, 10)),
            favoriteAuthor: fc
                .option(pickOne(authors))
                .map(x => (x === null ? undefined : x))
        }),
        0,
        10,
        (a, b) => a.id === b.id
    );

    fc.assert(
        fc.property(people, x => {
            const result = person.normalize(x);
            expect(result).toEqual(x.map(p => p.id));
            console.log(x);
            return true;
        })
    );
});

function pickOne<T>(arb: Arbitrary<T[]>): Arbitrary<T> {
    return pickN(arb, fc.constant(1)).map(arr => arr[0]);
}

function pickN<T>(
    arb: Arbitrary<T[]>,
    arbN: Arbitrary<number>
): Arbitrary<T[]> {
    return arbN.chain(n =>
        arb.chain(x =>
            fc
                .set(fc.integer(0, x.length), 0, Math.min(n, x.length))
                .map(indices => indices.map(idx => x[idx]))
        )
    );
}
