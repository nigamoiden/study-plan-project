import assert from "node:assert/strict";
import { test } from "node:test";

import { getSessionCookieOptions } from "./session-cookie.ts";

test("remembered sessions use a five-day secure cookie in production", () => {
  assert.deepEqual(getSessionCookieOptions(true, true), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 5 * 24 * 60 * 60,
  });
});

test("non-remembered sessions use a browser-session cookie", () => {
  assert.deepEqual(getSessionCookieOptions(false, false), {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
});
