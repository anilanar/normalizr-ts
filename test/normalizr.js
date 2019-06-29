/**
The MIT License (MIT)

Copyright (c) 2016 Dan Abramov, Paul Armstrong
https://github.com/paularmstrong/normalizr

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

import { denormalize, normalize, schema } from "normalizr";
import { define } from "../src";

describe("normalize", () => {
  test("normalizes entities", () => {
    const nz = new schema.Entity("tacos");
    const tnz = define()
      .id("id")
      .key("tacos");
    const obj = [{ id: 1, type: "foo" }, { id: 2, type: "bar" }];

    expect(tnz.normalize(obj)).toEqual(normalize(obj, [nz]));
  });

  test.only("normalizes nested entities", () => {
    const usern = new schema.Entity("users");
    const usert = define()
      .id("id")
      .key("users");

    const commentn = new schema.Entity("comments", {
      user: usern
    });
    const commentt = define()
      .id("id")
      .key("comments")
      .one("user", usert);

    const articlen = new schema.Entity("articles", {
      author: usern,
      comments: [commentn]
    });
    const articlet = define()
      .id("id")
      .key("articles")
      .one("author", usert)
      .many("comments", commentt);

    const input = [
      {
        id: "123",
        title: "A Great Article",
        author: {
          id: "8472",
          name: "Paul"
        },
        body: "This article is great.",
        comments: [
          {
            id: "comment-123-4738",
            comment: "I like it!",
            user: {
              id: "10293",
              name: "Jane"
            }
          }
        ]
      }
    ];

    expect(articlet.normalize(input)).toEqual(normalize(input, [articlen]));
  });

  test("can normalize object without proper object prototype inheritance", () => {
    const input = { id: 1, elements: [] };
    input.elements.push(
      Object.assign(Object.create(null), {
        id: 18,
        name: "test"
      })
    );

    const entity = define()
      .id("id")
      .key("test")
      .many(
        "elements",
        define()
          .id("id")
          .key("elements")
      );

    expect(() => entity.normalize([input])).not.toThrow();
  });
});

describe.skip("denormalize", () => {
  test("cannot denormalize without a schema", () => {
    expect(() => denormalize({})).toThrow();
  });

  test("returns the input if undefined", () => {
    expect(denormalize(undefined, {}, {})).toBeUndefined();
  });

  test("denormalizes entities", () => {
    const mySchema = new schema.Entity("tacos");
    const entities = {
      tacos: {
        1: { id: 1, type: "foo" },
        2: { id: 2, type: "bar" }
      }
    };
    expect(denormalize([1, 2], [mySchema], entities)).toMatchSnapshot();
  });

  test("denormalizes nested entities", () => {
    const user = new schema.Entity("users");
    const comment = new schema.Entity("comments", {
      user: user
    });
    const article = new schema.Entity("articles", {
      author: user,
      comments: [comment]
    });

    const entities = {
      articles: {
        "123": {
          author: "8472",
          body: "This article is great.",
          comments: ["comment-123-4738"],
          id: "123",
          title: "A Great Article"
        }
      },
      comments: {
        "comment-123-4738": {
          comment: "I like it!",
          id: "comment-123-4738",
          user: "10293"
        }
      },
      users: {
        "10293": {
          id: "10293",
          name: "Jane"
        },
        "8472": {
          id: "8472",
          name: "Paul"
        }
      }
    };
    expect(denormalize("123", article, entities)).toMatchSnapshot();
  });

  test("does not modify the original entities", () => {
    const user = new schema.Entity("users");
    const article = new schema.Entity("articles", { author: user });
    const entities = Object.freeze({
      articles: Object.freeze({
        "123": Object.freeze({
          id: "123",
          title: "A Great Article",
          author: "8472"
        })
      }),
      users: Object.freeze({
        "8472": Object.freeze({
          id: "8472",
          name: "Paul"
        })
      })
    });
    expect(() => denormalize("123", article, entities)).not.toThrow();
  });

  test("denormalizes with function as idAttribute", () => {
    const normalizedData = {
      entities: {
        patrons: {
          "1": { id: "1", guest: null, name: "Esther" },
          "2": { id: "2", guest: "guest-2-1", name: "Tom" }
        },
        guests: { "guest-2-1": { guest_id: 1 } }
      },
      result: ["1", "2"]
    };

    const guestSchema = new schema.Entity(
      "guests",
      {},
      {
        idAttribute: (value, parent, key) =>
          `${key}-${parent.id}-${value.guest_id}`
      }
    );

    const patronsSchema = new schema.Entity("patrons", {
      guest: guestSchema
    });

    expect(
      denormalize(
        normalizedData.result,
        [patronsSchema],
        normalizedData.entities
      )
    ).toMatchSnapshot();
  });
});
