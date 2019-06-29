import { schema } from "normalizr";

export const author = new schema.Entity("author");
export const book = new schema.Entity(
    "book",
    {
        author,
        authors: [author]
    },
    {
        idAttribute: "isbn"
    }
);
export const person = new schema.Entity("person", {
    favoriteAuthor: author,
    favoriteBooks: [book]
});
