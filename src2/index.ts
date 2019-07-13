import { pipe } from "fp-ts/es6/pipeable";
import { entity } from "./Entity";
import { one } from "./one";
import { many } from "./many";

interface Person {
    id: number;
    name: string;
}

interface Book {
    isbn: string;
    fav: Person | undefined;
    favs: Person[]
}

const person = entity("person", (p: Person) => p.id);

const book = pipe(
    entity("book", (b: Book) => b.isbn),
    one("fav", person),
    many("favs", person)
);

export const x = book.normalize(null as any).entities.book[""].fav;
export const y = book.normalize(null as any).entities.book[""].favs;
