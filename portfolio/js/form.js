// 問い合わせデモフォーム
// バリデーションと完了表示のUXデモ。実際の送信は行わない（CONTEXT.md「デモフォーム」参照）
(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  var success = document.getElementById("contact-success");
  if (!form || !success) return;

  function validateField(field) {
    var ok = field.checkValidity();
    var error = form.querySelector('[data-error-for="' + field.id + '"]');
    if (error) error.hidden = ok;
    field.classList.toggle("is-invalid", !ok);
    return ok;
  }

  // エラー表示中のフィールドは入力のたびに再判定して即時解除する
  form.addEventListener("input", function (e) {
    if (e.target.classList.contains("is-invalid")) {
      validateField(e.target);
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var fields = form.querySelectorAll("input[required], textarea[required]");
    var firstInvalid = null;
    for (var i = 0; i < fields.length; i++) {
      if (!validateField(fields[i]) && !firstInvalid) {
        firstInvalid = fields[i];
      }
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // デモのため送信処理は行わず、送信中の見た目だけ再現して完了表示に切り替える
    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = "送信中…";
    setTimeout(function () {
      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: "smooth", block: "center" });
      // フォームは非表示になるが、再表示時に「送信中…」のまま残らないよう状態を戻す
      button.disabled = false;
      button.textContent = "送信する（デモ）";
    }, 600);
  });
})();
