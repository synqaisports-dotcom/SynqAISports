import test from "node:test";
import assert from "node:assert/strict";
import { isUuidLike } from "./operativa-sync";

test("isUuidLike devuelve true para UUID válido", () => {
  assert.equal(isUuidLike("550e8400-e29b-41d4-a716-446655440000"), true);
});

test("isUuidLike devuelve false para valores no UUID", () => {
  assert.equal(isUuidLike("global-hq"), false);
  assert.equal(isUuidLike(""), false);
  assert.equal(isUuidLike(undefined), false);
});
