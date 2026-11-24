import assert from "node:assert/strict";
import { test } from "node:test";

import { canManageAuthoredContent } from "./lesson-permissions.ts";

test("super admin can manage lessons from every role", () => {
  assert.equal(canManageAuthoredContent("super_admin", "root", "admin-1", "admin"), true);
  assert.equal(canManageAuthoredContent("super_admin", "root", "teacher-1", "teacher"), true);
});

test("admin can manage ordinary member lessons but not super admin lessons", () => {
  assert.equal(canManageAuthoredContent("admin", "admin-1", "teacher-1", "teacher"), true);
  assert.equal(canManageAuthoredContent("admin", "admin-1", "admin-2", "admin"), true);
  assert.equal(canManageAuthoredContent("admin", "admin-1", "root", "super_admin"), false);
});

test("teacher can manage only their own lessons", () => {
  assert.equal(canManageAuthoredContent("teacher", "teacher-1", "teacher-1", "teacher"), true);
  assert.equal(canManageAuthoredContent("teacher", "teacher-1", "teacher-2", "teacher"), false);
});
