import { pipe } from "fp-ts/es6/pipeable";
import { entity } from "./Entity";
import { one } from "./one";

interface Person {
    id: number;
    name: string;
}

interface Book {
    isbn: string;
    fav: Person | null | undefined;
}

const person = entity("person", (p: Person) => p.id);

const book = pipe(
    entity("book", (b: Book) => b.isbn),
    one("fav", person)
);
