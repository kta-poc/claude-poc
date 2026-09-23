# 共通テスト仕様書形式

スプレッドシート項目定義書を、複数runとflowで再利用できる共通仕様へ正規化する。`test-spec.yml` を唯一の保存成果物かつ正本とする。

```text
test-specs/<spec-id>/
  test-spec.yml
```

## 必須構造

```yaml
schema_version: 1
spec:
  id: e2e-flow-employer-fields
  revision: 1
  created_at: 2026-09-23T10:00:00+09:00
  page_id: e2e-flow-employer

source:
  type: spreadsheet
  workbook: application-fields.xlsx
  sheet: 勤務先情報
  range: A1:F3
  sha256: "<sha256>"
  retrieved_at: 2026-09-23T09:55:00+09:00
  columns:
    item_name: 項目名
    dom_id: DOMのid
    format: 形式
    required: 必須有無
    initial_value: 初期値
    supplemental_text: 補足文言

mapping:
  reference: spreadsheet-mappings.yml
  schema_version: 1

items:
  employer-phone:
    status: resolved
    source_refs:
      item_name: 勤務先情報!A2
      dom_id: 勤務先情報!B2
      format: 勤務先情報!C2
      required: 勤務先情報!D2
      initial_value: 勤務先情報!E2
      supplemental_text: 勤務先情報!F2
    label: 電話番号
    dom_id: employer-phone
    locator:
      type: id
      value: employer-phone
    raw:
      format: 半角数字
      required: 必須
      initial_value:
        redacted: false
        value: ""
      supplemental_text: 半角数字で入力してください
    normalized:
      control_type: text-input
      constraints:
        required: true
        format: numbers
      initial_value:
        specified: true
        comparison: value
        state: empty-string
        value: ""
        sensitive: false
      supplemental_text:
        present: true
        value: 半角数字で入力してください
      observations:
        validation_error:
          strategy: aria-describedby-or-id-template
          locator:
            type: id
            value: employer-phone-error
        supplemental_text:
          strategy: exact-text-on-page

cases:
  - id: e2e-flow-employer-employer-phone-text-layout
    item_ref: employer-phone
    pattern_id: text-layout
    source_refs: [勤務先情報!A2:B2]
    applicability: applicable
    steps:
      - id: observe-phone
        action: observe
        target_ref: employer-phone
    expect:
      type: rendered
      target_ref: employer-phone
    evidence:
      layout: observe-phone

  - id: e2e-flow-employer-employer-phone-text-input
    item_ref: employer-phone
    pattern_id: text-input
    source_refs: [勤務先情報!B2:C2]
    applicability: applicable
    steps:
      - id: fill-valid-phone
        action: fill
        target_ref: employer-phone
        value: "0312345678"
    expect:
      type: value-reflected
      target_ref: employer-phone
      value: "0312345678"
    evidence:
      input-state: fill-valid-phone

  - id: e2e-flow-employer-employer-phone-field-initial-value
    item_ref: employer-phone
    pattern_id: field-initial-value
    source_refs: [勤務先情報!B2, 勤務先情報!E2]
    applicability: applicable
    steps:
      - id: observe-initial-phone
        action: observe
        target_ref: employer-phone
    expect:
      type: initial-value-matched
      target_ref: employer-phone
      value: ""
    evidence:
      initial-state: observe-initial-phone

  - id: e2e-flow-employer-employer-phone-field-supplemental-text
    item_ref: employer-phone
    pattern_id: field-supplemental-text
    source_refs: [勤務先情報!F2]
    applicability: applicable
    steps:
      - id: observe-supplemental-phone
        action: observe
        target_ref: employer-phone
    expect:
      type: supplemental-text-rendered
      target_ref: employer-phone
      value: 半角数字で入力してください
    evidence:
      supplemental-text: observe-supplemental-phone

  - id: e2e-flow-employer-employer-phone-text-required
    item_ref: employer-phone
    pattern_id: text-required
    source_refs: [勤務先情報!A2:F2]
    applicability: applicable
    steps:
      - id: clear-phone
        action: clear
        target_ref: employer-phone
      - id: validate-phone
        action: blur
        target_ref: employer-phone
    expect:
      type: validation-error
      target_ref: employer-phone
    evidence:
      validation-error: validate-phone

  - id: e2e-flow-employer-employer-phone-text-format
    item_ref: employer-phone
    pattern_id: text-format
    source_refs: [勤務先情報!B2:C2]
    applicability: applicable
    steps:
      - id: fill-invalid-phone
        action: fill
        target_ref: employer-phone
        value: ABC
      - id: validate-format-phone
        action: blur
        target_ref: employer-phone
    expect:
      type: validation-error
      target_ref: employer-phone
    evidence:
      validation-error: validate-format-phone

non_applicable:
  - item_ref: employer-phone
    pattern_id: text-length
    reason: 項目定義書の6列から最大長を確定できない
    source_refs: [勤務先情報!A2:F2]
unresolved: []
```

## 規則

- `spec.id` はASCII kebab-case、`revision` は内容変更ごとに増やす。
- sourceのworkbook、sheet、range、SHA-256または同等の不変な版識別子を必須とする。
- 1つの仕様書は1つの `page_id` を対象とする。項目定義書に画面ID列がないため、変換時にユーザーまたは設定から取得する。
- item IDはDOM IDがASCIIへ安全に正規化できればkebab-caseを使い、それ以外は `field-row-<行番号>` とする。衝突する場合は設定エラーとする。
- `locator.type` は `id`、`locator.value` はスプレッドシートの生DOM IDとする。
- raw値を保持し、正規化結果だけからrawを復元しない。
- `items.<id>.status` は `resolved` または `unresolved` とする。未知形式などでcontrolを確定できない行も、label、DOM ID、locator、秘密値以外のraw値、source_refsを持つ `unresolved` itemとして保持し、casesは生成しない。
- `normalized.initial_value` はcontrol別の `comparison` と正規化済みstate/valueを持つ。text-input/textareaは `value`、select/radioは既定で `label`、checkboxは `checked` と比較する。空欄の正規化はmappingに従う。
- sensitiveな初期値は例外としてraw値を保持しない。rawとnormalizedの双方を `{ redacted: true, display: "***", value_ref: "spreadsheet:<sheet>!<cell>" }` とし、caseにも実値を複製しない。未知形式でsensitiveか判定できない行も初期値を保守的にredactする。
- case IDは `<page>-<item>-<pattern>` とし、deviceは実行計画で付加する。
- casesは [test-patterns.yml](../test-patterns.yml) と [テストカタログ](test-catalog.md) に従って仕様書作成時に確定する。実行計画作成時にケースを追加・削除・再推論しない。
- patternの短いstepは仕様書生成時に構造化する。`observe-initial` と `observe-supplemental-text` は `action: observe`、`fill-valid` と `fill-invalid-format` はmapping値を持つ `action: fill`、`validate` は原則 `action: blur` へ展開する。
- `non_applicable` はcontrolは一致するが条件を満たさないpatternと理由を記録する。
- `unresolved` は未知のmapping、観測方法不足、値不足など仕様を確定できない項目をセル参照付きで記録する。1件でもあれば実行計画を作成しない。
- flow、device、base URL、session、run ID、実行時resetは共通仕様書へ含めない。

## planへの展開

`plan.yml` は参照するtest-specのID、revision、SHA-256を固定し、itemsを `targets`、casesをdevice別caseへ複製する。初期値ケースは新規または初期状態のsession groupへ分離する。test-specが変更された場合、既存planを変更せず新しいrunを作る。

## unresolvedの構造

各要素は `code`、`message`、`item_ref`、`source_ref`、安全に記録できる `raw_value`、`blocking` を持つ。`blocking: true` が1件でもあればplanを作成しない。未知形式の行はpartial itemとして保持するが、control、normalized constraints、casesは生成しない。

planを作成できない場合は、`test-spec.yml` へのリンクと、各blocking要素の `item_ref`、sheet・cellを含む `source_ref`、`code`、`message`、解消に必要なmappingまたはセル修正をチャットへ要約する。

```yaml
items:
  field-row-4:
    status: unresolved
    source_refs:
      item_name: 勤務先情報!A4
      dom_id: 勤務先情報!B4
      format: 勤務先情報!C4
      required: 勤務先情報!D4
      initial_value: 勤務先情報!E4
      supplemental_text: 勤務先情報!F4
    label: 郵便番号
    dom_id: employer-postal-code
    locator:
      type: id
      value: employer-postal-code
    raw:
      format: 郵便番号（ハイフン有）
      required: 必須
      initial_value:
        redacted: true
        display: "***"
        value_ref: spreadsheet:勤務先情報!E4
      supplemental_text: ハイフンを含めて入力してください

unresolved:
  - code: unknown-format
    message: 形式をspreadsheet-mappings.ymlで解決できない
    item_ref: field-row-4
    source_ref: 勤務先情報!C4
    raw_value: 郵便番号（ハイフン有）
    blocking: true
```
