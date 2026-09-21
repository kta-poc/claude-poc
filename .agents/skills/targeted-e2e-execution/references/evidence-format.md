# 証跡・出力形式

新しい実行はリポジトリ直下へ保存する。既存成果物は移行しない。

```text
test-results/<run-id>/
  plan.md
  report.md
  <case-id>--<checkpoint>.png
```

## ID

run IDは `YYYYMMDD-HHmmss-<screen>-<scope>` とし、変更されない1つの計画と最大1回の実行を表す。衝突時は連番を付け、既存ディレクトリを上書きしない。

1 runには、同じ開始画面の複数項目、PC/SP、承認済みフローの後続画面を含めてよい。独立画面、計画変更、再実行は新しいrunにする。

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

## plan.md

[plan-template.md](../templates/plan-template.md) の全placeholderを展開する。

- `{{metadata}}`: run ID、作成日時、base URL、execution URL、画面ID、devices、patternファイル
- `{{scope}}`: 対象、対象外、状態変更操作
- `{{ui_discovery}}`: 読み取り専用調査結果
- `{{defaults}}`: 非対象項目のマスク済みdefault
- `{{test_cases}}`: case ID、pattern ID、steps、入力、expect、evidence
- `{{non_applicable_patterns}}`: 非適用patternと理由
- `{{execution_rules}}`: 承認後の実行ルール
- `{{approval_prompt}}`: 「このテスト計画を承認しますか？」

上記placeholderはすべて必須である。欠落、未知のplaceholder、生成後の未展開placeholderは設定エラーにする。

## report.md

[report-template.md](../templates/report-template.md) の全placeholderを展開する。

- `{{metadata}}`: run ID、URL、画面ID、devices、開始/終了日時、全体判定、pattern/planファイル
- `{{summary}}`: `OK`、`NG`、`not applicable`、`blocked` の件数
- `{{case_list}}`: case ID、pattern ID、判定、証跡リンク
- `{{case_details}}`: 対象、前提、steps、マスク済み入力、expect、実観測、判定、証跡、備考

上記placeholderはすべて必須である。欠落、未知のplaceholder、生成後の未展開placeholderは設定エラーにする。

非OKでは理由を必須とし、reportからplanと全証跡へ相対リンクする。

パスワード、tokenその他の秘密値を平文で書かない。フルページ画像へ秘密値が写る場合は撮影せずblockedにする。
