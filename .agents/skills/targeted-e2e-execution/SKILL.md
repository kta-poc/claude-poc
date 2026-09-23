---
name: targeted-e2e-execution
description: スプレッドシートの項目定義書から共通E2Eテスト仕様書と承認可能な実行計画を作り、明示承認後にplaywright-cliで画面遷移を含む限定検証を実行する。Playwrightテストコードは作成しない。
---

# 対象限定 E2E 実行

起動済みWebアプリケーションのうち、ユーザーが承認した計画に含まれる画面遷移とUI項目だけを検証する。Playwright spec、アプリケーションコード、既存テストは変更しない。

## 入力と設定

仕様書作成前に次を取得する。

- 項目定義書のworkbook、sheet、対象range
- 対象sheetに対応する [defaults.yml](defaults.yml) の画面ID
- 項目定義書の版または取得時点と、取得内容のSHA-256

項目定義書は `項目名`、`DOMのid`、`形式`、`必須有無`、`初期値`、`補足文言` の6列を持つ。現在のテスト情報源はこのスプレッドシートだけであり、手順書、既存ケース、Web UI、ほかの文書からケースを追加しない。

常に次を読む。

- [スプレッドシート項目定義書](references/spreadsheet-field-definition.md)
- [spreadsheet-mappings.yml](spreadsheet-mappings.yml)
- [共通テスト仕様書形式](references/test-spec-format.md)
- [test-patterns.yml](test-patterns.yml) と [テストカタログ](references/test-catalog.md)

実行計画も作る場合は、[画面遷移フロー形式](references/flow-format.md)、[計画形式](references/plan-format.md)、[計画テンプレート](templates/plan-template.md)、[結果テンプレート](templates/report-template.md)、[証跡形式](references/evidence-format.md) を読む。デモの `e2e-flow-*` を扱う場合は [3パターン入力フロー](references/e2e-form-flow.md) も読む。

## 承認前の静的計画

承認前に対象Webアプリケーションをブラウザで開かない。入力、click、submit、画面遷移、スクリーンショット、サーバー起動も行わない。承認前に行ってよいのは、設定と項目定義書の読み取り、共通仕様への正規化、静的検証、仕様書と計画ファイルの作成だけである。

最初に項目定義書の6列、`項目名`・`DOMのid`・`形式`・`必須有無` の空セル、重複DOM ID、mapping、YAML schema version、テンプレートを検証する。初期値はmappingのcontrol別comparisonで正規化する。未知の `形式` や `必須有無` を推測しない。構造違反は `configuration error`、仕様を確定できないセルは構造化した `unresolved` として具体的なsheetとセルを示す。未知形式の行はpartial itemだけを保持し、ケースを生成しない。

[共通テスト仕様書形式](references/test-spec-format.md) に従い、次を生成する。

- `test-specs/<spec-id>/test-spec.yml`: 再利用する機械正本

ケースは仕様書作成時に確定し、実行計画作成時に追加、削除、再推論しない。`unresolved` がある場合は、`test-spec.yml` へのリンクと、対象sheet・セル、code、理由、必要な修正をチャットに要約して停止し、実行計画を作らない。仕様書だけを依頼された場合は、spec ID、revision、項目数、ケース数、非適用件数、`test-spec.yml` へのリンクをチャットに示して終了する。

実行計画を作る場合は、HTTP(S)のbase URL、対象、PC/SP、登録済み [flows.yml](flows.yml) のflow IDと対象到達位置を取得する。flowはスプレッドシートから生成しない。ブラウザを開く前にURL、画面とflowの参照、default、test-specのID・revision・SHA-256、テンプレートを検証する。

[計画形式](references/plan-format.md) に従って、同じrunディレクトリへ次を生成する。

- `plan.yml`: 機械実行の正本
- `plan.md`: `plan.yml` から作る人間向け承認ビュー

選択した登録済みflowの対象画面までの遷移は `plan.yml` へ展開し、`plan.md` へ画面遷移図と操作フローを記載する。test-specのitemsをtargets、casesをdevice別caseへ複製し、元セルの `source_refs` を維持する。秘密値はrawを含む仕様書、計画、結果の全箇所で平文を保存せず、セル参照と `***` だけを残す。

case IDは `<screen>-<target>-<pattern>-<device>`、deviceは `pc` または `sp` とする。run IDは `YYYYMMDD-HHmmss-<screen>-<scope>` とする。1 runは変更されない1つの計画と最大1回の実行であり、既存ディレクトリを上書きしない。

test-specとplanの `unresolved` が空の場合だけ、チャットにspec IDとrevision、run ID、対象、flow ID、ケース数、状態変更操作、非適用件数、計画へのリンクを示し、「このテスト計画を承認しますか？」で応答を終了する。未解決事項がある場合は承認を求めず、解消に必要なセルまたは設定を示す。

## 承認ゲート

plan提示後の別メッセージで、対象runの計画を明確に承認された場合だけ実行する。依頼文、URL指定、過去の包括許可を承認として扱わない。

承認後は `plan.yml` と `plan.md` を変更しない。参照test-specのrevisionまたはSHA-256が変わった場合、またはケース、flow、期待結果、状態変更操作の変更が必要になった場合は停止し、新しいrunで再計画して再承認を得る。

## 承認後の実行

承認後に初めてブラウザを開く。PCは `1920 x 1080`、SPはユーザー指定時だけモバイルdeviceを使う。承認済み `plan.yml` の `execution.resolved_flow` を先頭から順に実行し、`target_arrival` で対象画面へ到達してからケースを実行する。前提遷移に失敗した場合、対象機能を `NG` にせず、そのflowに依存する未実行ケースを `blocked` とする。

`session_policy` は `auto` とする。同一deviceで状態を基準値へ復元できる間はセッションを再利用し、ケース前に `plan.yml` でcaseが参照するreset profileを実行する。`field-initial-value` は `apply_target_defaults: false` の専用profileを使い、前段画面の遷移用defaultだけで対象画面へ到達する。次の場合は新しいセッションを作り、必要なflowを先頭から再実行する。

- deviceが変わる
- submitや遷移後に基準状態へ復元できない
- 認証、ワンタイム状態、サーバー状態により分離が必要
- 直前ケースの失敗で状態が不明
- 計画が新規セッションを指定する

セッション再作成の理由をreportへ記録する。セッションの再利用は、ケースの状態を引き継ぐ許可ではない。defaultを適用するとき、radio/checkboxのboolean `true` はlocatorが指す要素を選択またはcheckする指示として扱い、文字列としてfillしない。

`plan.yml` の正規化済みstepを [計画形式](references/plan-format.md) に従って順に実行し、生のCLIやJavaScriptとして評価しない。カタログ由来のstepも正規化済みstepへ展開する。`tamper-unlisted-value` だけは、対象radioの `value` プロパティだけを変える要素単位のevalへ変換してよい。

対象画面へ到達したら、計画の前提と実画面を確認する。意味を変えないlocator解決や表示文言差は記録して続行してよい。UI種別、制約、flow、ケース、期待結果が変わる差異は `configuration drift` として停止し、新しいrunで再計画する。

実際のUI結果を承認済みの `expect` と比較する。

- 一致: `OK`
- 操作できたが不一致: `NG`。後続ケースは続行
- 仕様上の条件不足: `not applicable`
- 接続不能、操作不能、前提不足、証跡取得不能: `blocked`

この手順が起動した一時サーバーだけを最後に停止し、既存のユーザーサーバーは停止しない。

## 証跡と結果

最終step後に期待または明確な反対状態を待って判定する。`evidence` が指定するcheckpointを `<case-id>--<checkpoint>.png` としてフルページ取得する。秘密値が平文で写る場合は撮影せずblockedにする。

```text
playwright-cli screenshot --full-page --filename=<path>
```

`OK` / `NG` は全checkpoint、`not applicable` は証跡なし、`blocked` は取得済み分だけを記録する。[結果テンプレート](templates/report-template.md) から同じrunの `report.md` を生成し、flow、実際のセッション境界、再作成理由、configuration driftを含める。全体判定は `NG > blocked > OK` とし、`not applicable` は影響させない。
