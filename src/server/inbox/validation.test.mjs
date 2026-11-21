import assert from "node:assert/strict";
import test from "node:test";

import {
  inboxMessagePatchSchema,
  isSameOrigin,
} from "./validation.ts";

test("accepts a valid inbox read update", () => {
  assert.equal(
    inboxMessagePatchSchema.safeParse({
      messageId: "message-id-123",
      read: true,
    }).success,
    true
  );
});

test("rejects client-supplied identity and unknown fields", () => {
  assert.equal(
    inboxMessagePatchSchema.safeParse({
      messageId: "message-id-123",
      read: true,
      uid: "another-user",
      role: "admin",
    }).success,
    false
  );
});

test("rejects invalid IDs and read values", () => {
  for (const payload of [
    { messageId: "../other-user", read: true },
    { messageId: "", read: true },
    { messageId: "message-id-123", read: "true" },
  ]) {
    assert.equal(inboxMessagePatchSchema.safeParse(payload).success, false);
  }
});

test("rejects missing and cross-origin mutation requests", () => {
  assert.equal(isSameOrigin(null, "https://study.example"), false);
  assert.equal(
    isSameOrigin("https://attacker.example", "https://study.example"),
    false
  );
  assert.equal(
    isSameOrigin("https://study.example", "https://study.example"),
    true
  );
});
