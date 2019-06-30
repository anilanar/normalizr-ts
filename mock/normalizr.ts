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

export const user = new schema.Entity("user");
export const group = new schema.Entity("group", {
    users: [user]
});
export const candy = new schema.Entity("candy", {
    owner: new schema.Union(
        {
            user,
            group
        },
        "type"
    )
});
