import { schema } from "normalizr";

export const picture = new schema.Entity(
    "picture",
    {},
    {
        idAttribute: "url"
    }
);
export const user = new schema.Entity("user", {
    picture
});
export const message = new schema.Entity("message", {
    from: user,
    to: user
});

export const conversation = new schema.Entity("conversation", {
    messages: [message]
});
