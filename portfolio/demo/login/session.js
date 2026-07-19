// ログイン画面デモのセッション状態遷移（pure・イミュータブル）
// 状態保持はメモリのみ。sessionStorage等は使わない（リロードで未ログインに戻る仕様）
// status: "loggedOut" | "authenticating" | "loggedIn"

export const initialState = { status: "loggedOut", user: null };

export function startAuth(state) {
  if (state.status !== "loggedOut") return state;
  return { status: "authenticating", user: null };
}

export function loginSuccess(state, user) {
  if (state.status !== "authenticating") return state;
  return { status: "loggedIn", user };
}

export function loginFailure(state) {
  if (state.status !== "authenticating") return state;
  return { status: "loggedOut", user: null };
}

export function logout(state) {
  if (state.status !== "loggedIn") return state;
  return { status: "loggedOut", user: null };
}
