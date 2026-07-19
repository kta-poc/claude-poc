import test from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  startAuth,
  loginSuccess,
  loginFailure,
  logout,
} from "../demo/login/session.js";

test("未ログイン→認証中→ログイン中→ログアウトで未ログインに戻る", () => {
  assert.deepEqual(initialState, { status: "loggedOut", user: null });

  const authenticating = startAuth(initialState);
  assert.deepEqual(authenticating, { status: "authenticating", user: null });

  const loggedIn = loginSuccess(authenticating, { email: "demo@example.com" });
  assert.deepEqual(loggedIn, {
    status: "loggedIn",
    user: { email: "demo@example.com" },
  });

  const loggedOut = logout(loggedIn);
  assert.deepEqual(loggedOut, initialState);
});

test("不正な遷移は状態を変えない", () => {
  // 未ログインのままloginSuccess/logoutは効かない
  assert.deepEqual(
    loginSuccess(initialState, { email: "demo@example.com" }),
    initialState,
  );
  assert.deepEqual(logout(initialState), initialState);

  // ログイン中にstartAuth/loginFailureは効かない
  const loggedIn = { status: "loggedIn", user: { email: "demo@example.com" } };
  assert.deepEqual(startAuth(loggedIn), loggedIn);
  assert.deepEqual(loginFailure(loggedIn), loggedIn);
});
