# 正規化テスト計画形式

`test-results/<run-id>/plan.yml` は承認と実行の正本である。[共通テスト仕様書](test-spec-format.md) に確定済みの項目とケースへ、登録済みflow、device、session、証跡を付加する。`plan.md` は同じ内容を人が確認するための表示であり、独立して編集しない。

## 必須構造

次は構造説明用の抜粋である。実際の `targets` と `cases` には、参照test-specで確定した全対象を含める。

```yaml
schema_version: 2
run:
  id: 20260922-120000-e2e-flow-employer-phone
  created_at: 2026-09-22T12:00:00+09:00
  base_url: http://localhost:5173

planning:
  mode: spreadsheet-field-definition
  test_spec:
    reference: test-specs/e2e-flow-employer-fields/test-spec.yml
    id: e2e-flow-employer-fields
    revision: 1
    sha256: "<test-spec-sha256>"
  source_spreadsheet:
    workbook: application-fields.xlsx
    sheet: 勤務先情報
    range: A1:F3
    sha256: "<workbook-sha256>"
  assumptions: []
  unresolved: []

scope:
  flow:
    id: standard-completion
    source_type: registered
    registry_ref: flows.yml#standard-completion
  start_page: e2e-flow-personal
  target_page: e2e-flow-employer
  target_arrival: personal-to-employer
  devices: [pc]
  included: [employer-phone]
  excluded: []
  state_changes: [form-submit, page-transition]

execution:
  session_policy: auto
  reset_profiles:
    standard:
      before_each: [return-to-target, restore-defaults]
      apply_target_defaults: true
    initial-state:
      before_each: [new-session, rerun-flow]
      apply_target_defaults: false
  resolved_flow:
    - id: personal-to-employer
      from: e2e-flow-personal
      prepare:
        defaults: [name, birthdate, gender]
      action:
        type: submit
        locator: "#personal-next-button"
      to: e2e-flow-employer

defaults:
  - page: e2e-flow-personal
    field: name
    value_ref: defaults.yml#pages.e2e-flow-personal.fields.name.default
    display: "***"
  - page: e2e-flow-personal
    field: birthdate
    value_ref: defaults.yml#pages.e2e-flow-personal.fields.birthdate.default
    display: "***"
  - page: e2e-flow-personal
    field: gender
    value_ref: defaults.yml#pages.e2e-flow-personal.fields.gender.default
    display: selected
  - page: e2e-flow-employer
    field: company
    value_ref: defaults.yml#pages.e2e-flow-employer.fields.company.default
    display: "***"
  - page: e2e-flow-employer
    field: phone
    value_ref: defaults.yml#pages.e2e-flow-employer.fields.phone.default
    display: "***"

targets:
  employer-phone:
    page: e2e-flow-employer
    source_refs:
      item_name: 勤務先情報!A2
      dom_id: 勤務先情報!B2
      format: 勤務先情報!C2
      required: 勤務先情報!D2
      initial_value: 勤務先情報!E2
      supplemental_text: 勤務先情報!F2
    control_type: text-input
    locator:
      type: id
      value: employer-phone
    label: 電話番号
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
  - id: e2e-flow-employer-employer-phone-text-required-pc
    target_page: e2e-flow-employer
    target_ref: employer-phone
    pattern_id: text-required
    source_refs:
      - test-spec:e2e-flow-employer-fields#e2e-flow-employer-employer-phone-text-required
      - 勤務先情報!D2
    preconditions: []
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
    session_group: employer-pc
    reset_profile: standard

non_applicable: []
```

## 規則

- `schema_version` は `2`、`planning.mode` は `spreadsheet-field-definition` とする。
- `planning.test_spec` は実在する `test-spec.yml` のreference、ID、revision、SHA-256を持つ。生成時にhashを再計算し、一致しなければ停止する。
- `planning.source_spreadsheet` はtest-specが固定したworkbook、sheet、range、SHA-256を複製する。
- `planning.unresolved` が1件でもあれば計画未確定であり、承認を求めない。
- `scope.flow.source_type` は `registered` とし、[flows.yml](../flows.yml) のIDを `registry_ref` で参照する。項目定義書からflowを生成しない。
- `execution.resolved_flow` はflow全体ではなく、開始画面から `scope.target_arrival` までの確定済みstepを順序どおり保存する。対象が開始画面なら `target_arrival: start` と空配列を使う。それ以外では最終stepのIDが `target_arrival`、最終stepの `to` が `target_page` と一致しなければならない。
- 同じ画面へ複数回到達するflowでは、`target_arrival` に到達直前のstep IDを指定して実行位置を一意にする。
- `session_policy` は `auto` とする。例外的にケースが新規セッションを必要とする場合は、そのケースの `session_group` を分け、理由を計画へ記載する。
- `execution.reset_profiles` はケースまたはsession groupごとのresetを機械判定できる形で定義し、各caseは `reset_profile` を必須とする。復元方法が不明なら計画未確定とする。
- reset profileの `before_each` には通常UIで実行できる意味操作を順序どおり記載する。共通操作は `restore-defaults`、`return-to-target`、`rerun-flow`、`new-session` とし、生のCLIやJavaScriptを記載しない。
- `apply_target_defaults` は対象項目へ [defaults.yml](../defaults.yml) のdefaultを適用するかを示す。初期値以外のケースでは必要に応じてtrue、初期値ケースでは必ずfalseとする。
- targetsはtest-specのitemsから実行に必要なlabel、ID locator、control、constraints、initial value、supplemental text、observations、source_refsを意味変更せずコピーする。casesはtest-specのcasesへdevice suffix、session group、resetを加えてコピーする。計画作成時にケースを追加、削除、再推論しない。
- 各ケースの `source_refs` はtest-specのcase IDと元スプレッドシートのsheet・セル参照を維持する。
- `pattern_id` はtest-specで確定済みの [test-patterns.yml](../test-patterns.yml) のIDと一致させる。
- `targets` は承認後の実行とdrift判定に必要な対象定義を固定する。各targetは `page`、`control_type`、ID locator、label、constraints、期待結果を観測するための `observations` を持つ。
- `control_type` は `text-input`、`textarea`、`select`、`radio`、`checkbox`、`repeater`、`form`、`button`、`link`、`dialog`、`heading`、`text`、`region`、`page` のいずれかにする。
- `constraints` はtest-specで確定した値をコピーし、計画作成時に実画面から補完しない。
- ケースのstepは `id`、`action`、任意の `target_ref`、`value` または `value_ref` で表現する。`action` は `observe`、`fill`、`clear`、`select`、`check`、`uncheck`、`click`、`submit`、`blur`、`wait-for`、`add-item`、`remove-item`、`tamper-unlisted-value` のいずれかにする。生のCLIやJavaScriptを記載しない。
- test-specのstepと `evidence` 参照をそのまま保持する。
- `expect` は `type` と、必要な `target_ref`、`value`、`value_ref` を持つ。`type` はテストカタログのexpect、または `visible`、`hidden`、`text-equals`、`text-contains`、`url-is` のいずれかにする。
- `expect` と必要な観測方法を入力ソースまたは有効なテストパターンから確定できないケースを作らない。
- defaultは `value_ref` で参照元を固定する。秘密値は `display: "***"` とし、実値を計画へ保存しない。
- test-specの初期値は初期画面の期待状態、`defaults.yml` は遷移や非対象項目を有効にする値であり、値の不一致は矛盾ではない。両方が同じDOM IDを指す場合にlocatorが一致しなければ `configuration error` とする。
- `field-initial-value` ケースは `apply_target_defaults: false` かつ `before_each` に `new-session` と `rerun-flow`、または対象画面の初期状態へ戻せる同等の登録済み意味操作を持つ専用reset profileを参照する。A/B経由でCへ到達する場合も、A/Bの遷移用defaultだけを適用し、Cの対象項目defaultは適用しない。
- 初期値ケースの `resolved_flow` が対象画面へ最終到達する前に同じ対象画面を訪れる、または同じDOM IDへdefaultを設定する場合は初期状態を保証できない。最初の到達位置を選ぶか、保証可能な専用flowを登録し、どちらもできなければ計画を未解決とする。

## 実画面との差異

承認後の実行時、表示文言や意味を変えないlocator解決の差はreportへ記録して継続できる。UI種別、制約、画面遷移、ケース、期待結果が変わる差異は `configuration drift` とし、現在のrunを停止して新しい計画を作る。
