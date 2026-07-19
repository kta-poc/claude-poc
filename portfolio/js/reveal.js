// スクロールで画面に入った要素に .is-visible を付けて出現アニメーションを発火させる。
// 初期非表示スタイルは .js-reveal 配下にのみ適用するため、JSが動かない環境では全要素が普通に表示される。
(() => {
  document.documentElement.classList.add("js-reveal");

  const targets = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  // 出現完了後は data-reveal を外し、[data-reveal] のtransitionがカード自身の
  // ホバー用transition（box-shadow等）を上書きし続けないようにする
  const cleanup = (el) => {
    el.removeAttribute("data-reveal");
    el.classList.remove("is-visible");
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add("is-visible");
          observer.unobserve(el);
          // 子要素からバブリングしてくるtransitionendで誤発火しないよう対象を確認する
          const onEnd = (e) => {
            if (e.target !== el) return;
            el.removeEventListener("transitionend", onEnd);
            cleanup(el);
          };
          el.addEventListener("transitionend", onEnd);
          // reduced-motion等でtransitionが走らない場合のフォールバック
          setTimeout(() => cleanup(el), 1000);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px" },
  );

  targets.forEach((el) => observer.observe(el));
})();
