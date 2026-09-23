# 証跡・出力形式

新しい実行はリポジトリ直下へ保存する。既存成果物は移行しない。

```text
test-specs/<spec-id>/
  test-spec.yml

test-results/<run-id>/
  plan.yml
  plan.md
  report.md
  <case-id>--<checkpoint>.png
```

## ID

run IDは `YYYYMMDD-HHmmss-<screen>-<scope>` とし、変更されない1つの計画と最大1回の実行を表す。衝突時は連番を付け、既存ディレクトリを上書きしない。

1 runには、同じ承認済みflow上の複数項目とPC/SPを含めてよい。独立flow、計画変更、再実行は新しいrunにする。

case IDは `<screen>-<target>-<pattern>-<device>` のASCII kebab-caseとする。deviceは `pc` または `sp`。

## evidence

YAMLでは `checkpoint: 撮影直前のstep` と書く。

```yaml
evidence:
  tampered-state: tamper-unlisted-value
  submit-result: submit
```

同じpattern内でstep名を重複させず、evidenceの値は一意なstepを指す。evidenceの並び順を操作順として扱わない。

中間stepのcheckpointは操作直後に撮影し、pattern全体のexpectはまだ判定しない。evidenceの有無にかかわらず、最終step後はexpectまたは明確な反対状態を最大10秒待って判定する。最終stepのcheckpointがあれば判定後に撮影する。どちらも現れなければexpect不一致として `NG`、待機や画面観測自体ができなければ `blocked` とする。

ファイル名を `<case-id>--<checkpoint>.png` としてフルページ取得する。

```text
playwright-cli screenshot --full-page --filename=<path>
```

`OK` / `NG` は全checkpoint、`not applicable` は証跡なし、`blocked` は取得済み分だけを残す。

## test-spec.yml

`test-spec.yml` は [共通テスト仕様書形式](test-spec-format.md) に従う再利用可能な唯一の共通仕様書である。`unresolved` があっても保存するが、実行計画は生成しない。ユーザーには `test-spec.yml` へのリンクと、対象sheet・セル、code、理由、必要な修正をチャットで要約する。

## plan.yml

[正規化テスト計画形式](plan-format.md) に従う機械実行の正本である。参照test-specと元spreadsheetの版、選択flow、対象到達位置、展開済み遷移、対象要素と制約、`session_policy`、reset profiles、各caseのprofile参照、正規化済みstep、期待結果、証跡、`source_refs` を保存する。

承認後は変更しない。実行中にケース、flow、期待結果、状態変更操作の変更が必要になった場合は、新しいrunで作り直す。

## plan.md

[plan-template.md](../templates/plan-template.md) の全placeholderを展開する。

- `{{metadata}}`: run ID、作成日時、base URL、devices、plan.ymlへのリンク
- `{{test_spec_source}}`: test-specのID、revision、SHA-256、リンクと、元workbook、sheet、range、SHA-256、項目・ケース・非適用件数
- `{{scope}}`: flow IDと出典、開始画面、対象画面、対象到達位置、対象、対象外、状態変更操作
- `{{flow_diagram}}`: 選択flowのMermaid画面遷移図
- `{{operation_flow}}`: 展開済み遷移、準備入力、操作、遷移先
- `{{assumptions_and_defaults}}`: 静的な前提とマスク済みdefault
- `{{session_strategy}}`: `session_policy`、reset profiles、各caseのprofile、対象default適用有無、新規セッション条件
- `{{test_cases}}`: case ID、source_refs、target定義、pattern ID、正規化済みsteps、入力、expect、evidence
- `{{non_applicable_patterns}}`: 非適用patternと理由
- `{{unresolved_items}}`: 未解決事項。1件でもあれば承認を求めない
- `{{execution_rules}}`: 承認後の実行ルール
- `{{approval_prompt}}`: 未解決事項がなければ「このテスト計画を承認しますか？」。未解決事項があれば「未解決事項があるため承認依頼を行いません。」

上記placeholderはすべて必須である。欠落、未知のplaceholder、生成後の未展開placeholderは設定エラーにする。

## report.md

[report-template.md](../templates/report-template.md) の全placeholderを展開する。

- `{{metadata}}`: run ID、URL、flow ID、devices、test-spec ID・revision・SHA-256、開始/終了日時、全体判定、pattern/planファイル
- `{{execution_context}}`: 実行したflow、セッション境界、セッション再作成理由、reset結果
- `{{summary}}`: `OK`、`NG`、`not applicable`、`blocked` の件数
- `{{case_list}}`: case ID、pattern ID、判定、証跡リンク
- `{{case_details}}`: 対象、前提、steps、マスク済み入力、expect、実観測、判定、証跡、備考
- `{{configuration_drift}}`: 実画面との差異と、継続または再計画の判断

上記placeholderはすべて必須である。欠落、未知のplaceholder、生成後の未展開placeholderは設定エラーにする。

非OKでは理由を必須とし、reportからplanと全証跡へ相対リンクする。

パスワード、tokenその他の秘密値を平文で書かない。フルページ画像へ秘密値が写る場合は撮影せずblockedにする。
