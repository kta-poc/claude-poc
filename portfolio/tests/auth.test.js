import test from "node:test";
import assert from "node:assert/strict";
import { authenticate, validateCredentials } from "../demo/login/auth.js";

test("メール・パスワードとも正しければ認証成功しユーザー情報を返す", () => {
  const result = authenticate({
    email: "demo@example.com",
    password: "demo1234",
  });
  assert.deepEqual(result, { ok: true, user: { email: "demo@example.com" } });
});

test("メール・パスワードとも入力があればvalid", () => {
  const result = validateCredentials({
    email: "demo@example.com",
    password: "demo1234",
  });
  assert.deepEqual(result, { valid: true, errors: {} });
});

test("メール・パスワードとも空なら両方requiredエラー", () => {
  const result = validateCredentials({ email: "", password: "" });
  assert.deepEqual(result, {
    valid: false,
    errors: { email: "required", password: "required" },
  });
});

test("メールが空ならrequiredエラー", () => {
  const result = validateCredentials({ email: "", password: "demo1234" });
  assert.deepEqual(result, { valid: false, errors: { email: "required" } });
});

test("メール形式が不正ならformatエラー", () => {
  const result = validateCredentials({ email: "foo", password: "demo1234" });
  assert.deepEqual(result, { valid: false, errors: { email: "format" } });
});

test("メールが正しくパスワードが誤りならinvalid_credentials", () => {
  const result = authenticate({ email: "demo@example.com", password: "wrong" });
  assert.deepEqual(result, { ok: false, reason: "invalid_credentials" });
});

test("メールが誤りでも同じinvalid_credentials（どちらが違うかを明かさない）", () => {
  const wrongEmail = authenticate({
    email: "other@example.com",
    password: "demo1234",
  });
  const wrongPassword = authenticate({
    email: "demo@example.com",
    password: "wrong",
  });
  assert.deepEqual(wrongEmail, { ok: false, reason: "invalid_credentials" });
  assert.deepEqual(wrongEmail, wrongPassword);
});

test("メール前後の空白はtrimして判定される", () => {
  const result = authenticate({
    email: "  demo@example.com  ",
    password: "demo1234",
  });
  assert.deepEqual(result, { ok: true, user: { email: "demo@example.com" } });
});

test("メールの大文字小文字は無視される", () => {
  const result = authenticate({
    email: "Demo@Example.com",
    password: "demo1234",
  });
  assert.deepEqual(result, { ok: true, user: { email: "demo@example.com" } });
});

test("パスワードは大文字小文字を区別する", () => {
  const result = authenticate({
    email: "demo@example.com",
    password: "DEMO1234",
  });
  assert.deepEqual(result, { ok: false, reason: "invalid_credentials" });
});

test("パスワードが空ならrequiredエラー", () => {
  const result = validateCredentials({
    email: "demo@example.com",
    password: "",
  });
  assert.deepEqual(result, { valid: false, errors: { password: "required" } });
});
