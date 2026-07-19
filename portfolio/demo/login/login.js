// ログイン画面デモのDOM接着層
// 判定ロジックは auth.js / session.js（単体テスト済み）に委譲し、ここでは表示とイベントのみ扱う
import { authenticate, validateCredentials } from "./auth.js";
import {
  initialState,
  startAuth,
  loginSuccess,
  loginFailure,
  logout,
} from "./session.js";

const ERROR_MESSAGES = {
  email: {
    required: "メールアドレスを入力してください",
    format: "正しいメールアドレスを入力してください",
  },
  password: {
    required: "パスワードを入力してください",
  },
};

const form = document.getElementById("login-form");
const loginView = document.getElementById("login-view");
const mypageView = document.getElementById("mypage-view");
const mypageEmail = document.getElementById("mypage-email");
const mypageTitle = document.getElementById("mypage-title");
const authError = document.getElementById("login-auth-error");
const logoutButton = document.getElementById("logout-button");
const submitButton = form.querySelector('button[type="submit"]');

const fields = {
  email: document.getElementById("login-email"),
  password: document.getElementById("login-password"),
};

let state = initialState;

function render() {
  const loggedIn = state.status === "loggedIn";
  loginView.hidden = loggedIn;
  mypageView.hidden = !loggedIn;
  if (loggedIn) mypageEmail.textContent = state.user.email;

  const authenticating = state.status === "authenticating";
  submitButton.disabled = authenticating;
  submitButton.textContent = authenticating ? "ログイン中…" : "ログイン（デモ）";
}

function showFieldError(name, code) {
  const input = fields[name];
  const error = form.querySelector('[data-error-for="' + input.id + '"]');
  input.classList.toggle("is-invalid", Boolean(code));
  error.hidden = !code;
  error.textContent = code ? ERROR_MESSAGES[name][code] : "";
}

function readInput() {
  return { email: fields.email.value, password: fields.password.value };
}

// エラー表示中のフィールドは入力のたびに再判定して即時解除する（js/form.js と同じ流儀）
form.addEventListener("input", function (e) {
  authError.hidden = true;
  if (!e.target.classList.contains("is-invalid")) return;
  const name = e.target === fields.email ? "email" : "password";
  showFieldError(name, validateCredentials(readInput()).errors[name]);
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  authError.hidden = true;

  const input = readInput();
  const validation = validateCredentials(input);
  showFieldError("email", validation.errors.email);
  showFieldError("password", validation.errors.password);
  if (!validation.valid) {
    const firstInvalid = validation.errors.email ? fields.email : fields.password;
    firstInvalid.focus();
    return;
  }

  // 実認証は行わないため、送信中の見た目だけ再現して結果表示に切り替える（デモフォームと同じ流儀）
  const next = startAuth(state);
  if (next === state) return;
  state = next;
  render();
  setTimeout(function () {
    const result = authenticate(input);
    if (result.ok) {
      state = loginSuccess(state, result.user);
      form.reset();
    } else {
      state = loginFailure(state);
      authError.hidden = false;
    }
    render();
    // ビューが切り替わるとフォーカスがbodyに落ちるため、マイページ見出しへ明示的に移す（ログアウト側と対）
    if (result.ok) mypageTitle.focus();
  }, 600);
});

logoutButton.addEventListener("click", function () {
  state = logout(state);
  authError.hidden = true;
  render();
  fields.email.focus();
});

render();
