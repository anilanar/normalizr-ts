import { define } from "../src";
import { union } from "../src/types";

export interface Author {
    id: number;
    name: string;
}

export interface Book {
    isbn: string;
    name: string;
    date: Date;
    author: Author | null;
    authors: Author[] | null;
}

export interface Person {
    id: number;
    name: string;
    favoriteAuthor?: Author;
    favoriteBooks?: Book[] | null;
}

export interface User {
    id: number;
    type: "user";
    name: string;
}
export interface Group {
    id: number;
    type: "group";
    users: User[];
}
export interface Candy {
    id: number;
    owner: User | Group;
}

export const author = define<Author>()
    .id("id")
    .key("author");

export const book = define<Book>()
    .id("isbn")
    .key("book")
    .one("author", author)
    .many("authors", author);

export const person = define<Person>()
    .id("id")
    .key("person")
    .one("favoriteAuthor", author)
    .many("favoriteBooks", book);

export const user = define<User>()
    .id("id")
    .key("user");

export const group = define<Group>()
    .id("id")
    .key("group")
    .many("users", user);

type OwnerType = "user" | "group";

export const candy = define<Candy>()
    .id("id")
    .key("candy")
    .relation(
        "owner",
        owner => {
            if (owner.type === "group") {
                const { entities, result } = group.normalizeOne(owner);
                return {
                    entities,
                    result: { schema: owner.type as OwnerType, id: result }
                };
            }
            const { entities, result } = user.normalizeOne(owner);
            return {
                entities: { ...group.empty().entities, ...entities },
                result: { schema: owner.type, id: result }
            };
        },
        () => group.empty()
    );

const userOrGroup = union([user, group], e => (e.type === "user" ? 0 : 1));
const x = userOrGroup.normalizeOne((null as any) as User);
