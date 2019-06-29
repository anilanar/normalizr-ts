import { define } from "../src";

export interface Author {
    id: number;
    name: string;
}

export interface Book {
    isbn: string;
    name: string;
    date: Date;
    author: Author;
    authors: Author[];
}

export interface Person {
    id: number;
    name: string;
    favoriteAuthor?: Author;
    favoriteBooks: Book[];
    favoriteFriend?: Person;
}

export const author = define<Author>()
    .id("id")
    .key("author");

export const book = define<Book>()
    .id("isbn")
    .key("book")
    .one("author", author)
    .relation("authors", authors => author.normalize(authors), () => author.empty());

export const person = define<Person>()
    .id("id")
    .key("person")
    .one("favoriteAuthor", author)
    .many("favoriteBooks", book);
