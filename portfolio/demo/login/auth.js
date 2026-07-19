// ログイン画面デモの認証・バリデーションロジック（pure・DOM非依存）
// 実認証は行わない。固定のデモ用認証情報と照合するのみ（CONTEXT.md「デモフォーム」と同じ流儀）

export const DEMO_CREDENTIALS = {
  email: "demo@example.com",
  password: "demo1234",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function validateCredentials({ email, password }) {
  const errors = {};
  const trimmedEmail = email.trim();
  if (trimmedEmail === "") {
    errors.email = "required";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "format";
  }
  if (password === "") errors.password = "required";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function authenticate({ email, password }) {
  if (
    normalizeEmail(email) === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password
  ) {
    return { ok: true, user: { email: DEMO_CREDENTIALS.email } };
  }
  return { ok: false, reason: "invalid_credentials" };
}
