import { entity, pipe, one, many } from "../src2";
import { NumberFormatDefinition } from "ajv";

export interface Picture {
    url: string;
}

export interface User {
    id: number;
    username: string;
    realname: string;
    picture?: Picture;
}

export interface Message {
    id: number;
    from: User;
    to: User;
    body: string;
}

export interface Conversation {
    id: number;
    messages: Message[];
}

export const picture = entity("picture", (x: Picture) => x.url);
export const user = pipe(
    entity("user", (x: User) => x.id),
    one("picture", picture)
);
export const message = pipe(
    entity("message", (x: Message) => x.id),
    one("from", user),
    one("to", user)
);

export const conversation = pipe(
    entity("conversation", (x: Conversation) => x.id),
    many("messages", message)
);
