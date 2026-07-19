import { test, expect } from "@playwright/test";

test("デモ認証情報でログイン→マイページ→ログアウトでログイン画面に戻る", async ({
  page,
}) => {
  await page.goto("/demo/login/");
  await page.getByLabel(/メールアドレス/).fill("demo@example.com");
  await page.getByLabel(/パスワード/).fill("demo1234");
  await page.getByRole("button", { name: "ログイン（デモ）" }).click();

  await expect(page.locator("#mypage-view")).toBeVisible();
  await expect(page.locator("#mypage-email")).toHaveText("demo@example.com");
  await expect(page.locator("#login-view")).toBeHidden();
  await expect(page.locator("#mypage-title")).toBeFocused();

  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(page.locator("#login-view")).toBeVisible();
  await expect(page.locator("#mypage-view")).toBeHidden();
});

test("空のまま送信するとフィールドエラーが表示されメール欄にフォーカスする", async ({
  page,
}) => {
  await page.goto("/demo/login/");
  await page.getByRole("button", { name: "ログイン（デモ）" }).click();

  await expect(page.locator('[data-error-for="login-email"]')).toHaveText(
    "メールアドレスを入力してください",
  );
  await expect(page.locator('[data-error-for="login-password"]')).toHaveText(
    "パスワードを入力してください",
  );
  await expect(page.locator("#login-email")).toBeFocused();
  await expect(page.locator("#mypage-view")).toBeHidden();
});

test("誤った認証情報では総称エラーが表示されログイン画面に留まる", async ({
  page,
}) => {
  await page.goto("/demo/login/");
  await page.getByLabel(/メールアドレス/).fill("demo@example.com");
  await page.getByLabel(/パスワード/).fill("wrongpass");
  await page.getByRole("button", { name: "ログイン（デモ）" }).click();

  await expect(page.locator("#login-auth-error")).toBeVisible();
  await expect(page.locator("#login-auth-error")).toHaveText(
    "メールアドレスまたはパスワードが違います",
  );
  await expect(page.locator("#mypage-view")).toBeHidden();
});
