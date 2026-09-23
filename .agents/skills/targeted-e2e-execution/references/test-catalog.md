# 対象限定 E2E テストカタログ

有効なpatternと各patternの期待仕様は [test-patterns.yml](../test-patterns.yml) を正本とする。この文書は、項目定義書から [共通テスト仕様書](test-spec-format.md) のケースを導出するときに使う短いキーワードを補足する。

## YAMLの形

```yaml
schema_version: 3
patterns:
  - id: field-supplemental-text
    controls: [text-input, textarea, select, radio, checkbox]
    when: [supplemental-text-present]
    steps: [observe-supplemental-text]
    expect: supplemental-text-rendered
    evidence:
      supplemental-text: observe-supplemental-text
```

patternのキーは `id`、`controls`、任意の `when`、`steps`、`expect`、`evidence` だけを使う。YAMLに存在するpatternはすべて有効で、無効化したいpatternは削除する。

- `id`: 一意なASCII kebab-case
- `controls`: 対象UI種別
- `when`: すべて満たす必要がある追加条件。条件がなければ省略
- `steps`: 記載順に実行する操作
- `expect`: UIで観測する期待結果
- `evidence`: `checkpoint: 撮影直前のstep`。ファイル名は規約から導出

`controls`、`steps`、`evidence` は空にしない。同じpattern内でstepを重複させない。未知のキーやキーワード、重複ID、同じpatternに存在しないstepを指すevidenceは設定エラーとする。locator、生のCLI、生のJavaScriptは記載しない。

## 選定ルール

スプレッドシートの各行を正規化した後、次に従う。

1. 正規化済み仕様情報とcontrolが一致しないpatternは列挙しない。
2. controlは一致するが `when` を満たさないpatternは `not applicable` とする。
3. controlとwhenが一致するpatternは全件採用する。
4. `expect` は現在のUI挙動ではなく承認対象の期待仕様として扱う。
5. 最大長、選択肢数、選択解除可否など、6列が仕様として提供しない条件は「6列から確定できない」を理由に `not applicable` とする。
6. 必須列の値やmappingが未知・矛盾してcontrolを正規化できない場合、または成立すると判定したpatternの入力値・観測方法・`expect`を構成できない場合だけ、共通テスト仕様書の `unresolved` とする。

## controls

`text-input`、`textarea`、`select`、`radio`、`checkbox`、`repeater`、`form` を使う。

## when

| キーワード | 成立条件 |
|---|---|
| `required` | 入力ソースで必須制約を特定できる |
| `valid-test-value-known` | mappingの `test_values.valid` がnullではない |
| `invalid-format-test-value-known` | mappingの書式制約があり、`test_values.invalid` がnullではない |
| `max-length-known` | 入力ソースで最大長を特定できる |
| `supplemental-text-present` | `補足文言` が空ではない |
| `multiple-options` | 既定値以外の選択肢がある |
| `can-unselect` | DOM改変なしで未選択にできる、または初期状態が未選択 |
| `can-add` | 項目追加操作がある |
| `can-remove` | 削除対象がある、または追加して削除対象を作れる |
| `requested` | ユーザーが送信を対象として明示した |
| `can-submit` | UIから送信を試行できる |
| `allowed-values-known` | 入力ソースで許可済みのradio valueを特定できる |
| `result-visible` | 入力ソースで成功または拒否の観測方法を特定できる |
| `rejection-visible` | 入力ソースで改ざん拒否を示すエラーや送信不能状態を特定できる |

選択済みradioは通常操作で解除できないため、それだけでは `can-unselect` を満たさない。

## steps

| キーワード | 操作 |
|---|---|
| `observe` | 対象の表示と現在状態を観測する |
| `observe-initial` | 対象の初期値または初期選択状態を観測する |
| `observe-supplemental-text` | 補足文言の完全一致表示を観測する |
| `fill-valid` | mappingに登録された有効テスト値を入力する |
| `clear` | 対象を空にする |
| `fill-invalid-format` | 承認済み計画の書式へ違反する値を入力する |
| `fill-over-max` | 承認済み計画の最大長を1文字超える値を入力する |
| `select-other` | 既定値以外の選択肢を選ぶ |
| `unselect` | 空option選択やcheckbox解除など、通常UI操作だけで未選択にする |
| `add-item` | 項目を1件追加する |
| `ensure-removable-item` | 削除対象がなければ1件追加し、削除直前を件数比較の基準にする |
| `remove-item` | 対象を1件削除する |
| `select-valid` | 許可済みのradioを1つ選ぶ |
| `tamper-unlisted-value` | 対象radioのvalueだけを未許可値に変更する |
| `submit` | UIの通常操作で送信する |
| `validate` | focusを外してまず判定し、判定不能で必要な場合だけ有効なsubmitを使う |

`validate` は、入力制限などですでに期待との一致・不一致を判定できれば送信しない。disabledのsubmitは強制実行しない。

patternの短いstepは共通テスト仕様書の生成時に構造化stepへ展開する。`observe-initial` と `observe-supplemental-text` は `action: observe`、`fill-valid` と `fill-invalid-format` はmappingの値を持つ `action: fill`、`validate` は原則 `action: blur` とする。計画生成時はその構造を再解釈せずコピーし、対象要素、locator、必要な値を承認済み `plan.yml` に固定する。

固定値を使う独自patternだけ、次の形を許可する。値は計画と結果で常にマスクする。

```yaml
steps:
  - fill-literal: "テスト値"
```

## expect

| キーワード | OKとなる状態 |
|---|---|
| `rendered` | 対象とラベルが表示される |
| `value-reflected` | 入力値が対象へ反映される |
| `initial-value-matched` | mappingのcontrol別comparison規則で、空欄を含む項目定義書の初期値と一致する |
| `supplemental-text-rendered` | 項目定義書の補足文言が画面内に完全一致で表示される |
| `validation-error` | 対象に対応するエラーがUIに表示される |
| `length-enforced` | 超過入力が制限される、または長さエラーが表示される |
| `selection-reflected` | 選択変更が対象へ反映される |
| `item-count-increased` | 操作前より1件増える |
| `item-count-decreased` | 削除直前より1件減る |
| `submission-succeeded` | 成功状態または期待する後続画面をUIで確認できる |
| `submission-rejected` | エラーまたは改ざんに起因する送信不能状態をUIで明確に確認できる |

単に遷移しない、応答が遅い、JavaScriptエラーで停止しただけでは `submission-rejected` としない。通信内容やHTTPレスポンスは検査しない。

## pattern一覧

| pattern ID | 対象UI | 目的 |
|---|---|---|
| `text-layout` | text-input、textarea | コントロールとラベルの表示 |
| `text-input` | text-input、textarea | 有効値の反映 |
| `field-initial-value` | text-input、textarea、select、radio、checkbox | 初期値・初期選択状態 |
| `field-supplemental-text` | text-input、textarea、select、radio、checkbox | 補足文言の表示 |
| `text-required` | text-input、textarea | 必須違反時のエラー |
| `text-format` | text-input、textarea | 書式違反時のエラー |
| `text-length` | text-input、textarea | 長さ制約 |
| `choice-layout` | select、radio、checkbox | 初期表示と選択状態 |
| `choice-selection` | select、radio、checkbox | 選択変更 |
| `choice-required` | select、radio、checkbox | 未選択時の必須エラー |
| `repeater-layout` | repeater | 初期レイアウト |
| `repeater-add` | repeater | 1件追加 |
| `repeater-remove` | repeater | 1件削除 |
| `form-submit` | form | 明示指定された送信結果 |
| `radio-value-tampering` | radio | 未許可valueのUI上の拒否 |
