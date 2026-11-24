import assert from "node:assert/strict";
import { test } from "node:test";

import { createSessionSchema } from "./session-schema.ts";

test("accepts a Firebase ID token and defaults remember-me safely", () => {
  assert.deepEqual(createSessionSchema.parse({ idToken: "token" }), {
    idToken: "token",
    rememberMe: true,
  });
});

test("accepts an explicit remember-me choice", () => {
  assert.deepEqual(
    createSessionSchema.parse({ idToken: "token", rememberMe: false }),
    { idToken: "token", rememberMe: false }
  );
});

test("rejects missing tokens and client-supplied identity or role fields", () => {
  assert.equal(createSessionSchema.safeParse({ rememberMe: true }).success, false);
  assert.equal(
    createSessionSchema.safeParse({
      idToken: "token",
      rememberMe: true,
      uid: "victim-uid",
      role: "admin",
    }).success,
    false
  );
});
